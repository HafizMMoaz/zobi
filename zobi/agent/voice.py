"""Speech to text for the chat composer's microphone.

Two backends can serve a request, and the order between them is deliberate:

1. **local** - a Whisper engine running inside the Zobi container. Nothing
   leaves the machine, there is no per-minute cost, and it keeps working when
   the gateway is misconfigured or offline.
2. **gateway** - :func:`zobi.llm.service.transcribe`, which routes to whatever
   provider an admin configured with the transcription capability.

Local wins whenever it can actually serve, because the alternative ships a
recording of somebody's voice to a third party. That preference is also why a
*runtime* failure in the local engine is not quietly retried against the
gateway: the operator chose local, and silently uploading the audio after a
decode error would defeat that choice. Availability is decided up front;
failures after that are reported, not routed around.

Neither backend is a hard dependency. If the local packages are absent the
module falls back to the gateway; if neither can serve, callers get a
:class:`TranscriptionError` naming the exact fix.

Nothing in this module logs audio bytes or transcribed text. What the user
said is theirs.

Configuration (all optional, set in ``zobi_config.py``)::

    VOICE_BACKEND = "auto"          # "auto" | "local" | "gateway"
    VOICE_MAX_AUDIO_BYTES = 10485760        # 10 MiB
    VOICE_MAX_AUDIO_SECONDS = 300           # 5 minutes, local backend only
    VOICE_LOCAL_ENGINE = "auto"     # "auto" | "faster-whisper" | "openai-whisper"
    VOICE_LOCAL_MODEL = "base"      # size name, or a path to a converted model
    VOICE_LOCAL_DEVICE = "cpu"      # "cpu" | "cuda"
    VOICE_LOCAL_COMPUTE_TYPE = "int8"       # faster-whisper only
    VOICE_LOCAL_MODEL_DIR = None    # where model weights are cached
    VOICE_LOCAL_ALLOW_DOWNLOAD = False      # let the first request fetch weights
"""

from __future__ import annotations

import io
import logging
import os
import shutil
import threading
from dataclasses import dataclass
from typing import Any

from flask import current_app, has_app_context

logger = logging.getLogger(__name__)


class TranscriptionError(Exception):
    """Raised when audio cannot be turned into text.

    The message is written for whoever has to fix it - an operator reading a
    log or a user reading a toast - so it always says what to do next.
    """


#: Hard ceiling on the uploaded recording, in bytes. Opus at the bitrate
#: MediaRecorder defaults to runs roughly 0.25 MB per minute, so 10 MiB is
#: about forty minutes of speech: far past anything typed into a chat box, and
#: small enough that a bad request cannot exhaust a worker's memory. Raise it
#: with ``VOICE_MAX_AUDIO_BYTES``.
DEFAULT_MAX_AUDIO_BYTES = 10 * 1024 * 1024

#: Ceiling on decoded audio length, in seconds. Bytes alone are a poor proxy:
#: a highly compressed hour and a lossless minute can weigh the same, and it is
#: minutes of audio, not megabytes, that a Whisper model charges for in CPU.
#: Only the local backend enforces this, because only it decodes the audio
#: before transcribing; see :func:`transcribe_audio`. Change it with
#: ``VOICE_MAX_AUDIO_SECONDS``.
DEFAULT_MAX_AUDIO_SECONDS = 300

#: Whisper resamples everything to 16 kHz mono, so decoded frame count divided
#: by this is the duration in seconds.
_SAMPLE_RATE = 16000

_FASTER_WHISPER = "faster-whisper"
_OPENAI_WHISPER = "openai-whisper"

#: Whisper's training set covers 99 languages, and both engines auto-detect
#: when no hint is given. Surfaced through :func:`transcription_available` so
#: the UI can say so rather than assuming English.
_WHISPER_LANGUAGE_COUNT = 99

#: Container signatures, checked against the head of the upload. Browsers lie
#: about type through the filename and MediaRecorder's mimeType is not carried
#: on the blob once it reaches Flask, so the bytes decide. Chrome and Firefox
#: produce webm/opus, Firefox can also produce ogg/opus, and Safari produces
#: mp4/aac - all four are here, plus the lossless formats a desktop upload
#: might use.
_SIGNATURES: tuple[tuple[int, bytes, str], ...] = (
    (0, b"\x1a\x45\xdf\xa3", "webm"),  # EBML, ie. webm or matroska
    (0, b"OggS", "ogg"),
    (4, b"ftyp", "mp4"),
    (0, b"RIFF", "wav"),
    (0, b"fLaC", "flac"),
    (0, b"ID3", "mp3"),
)

#: What a browser is allowed to send. Anything else is refused before a byte
#: reaches a model.
SUPPORTED_FORMATS = ("webm", "ogg", "mp4", "m4a", "wav", "flac", "mp3")

_MODEL_LOCK = threading.Lock()
#: Loaded engines, keyed by the settings that produced them. Module level so a
#: gunicorn worker loads the weights once and reuses them for every request it
#: ever serves; loading is seconds of CPU and hundreds of MB of RAM.
_MODELS: dict[tuple[Any, ...], Any] = {}


@dataclass(frozen=True)
class _LocalSettings:
    """Everything that identifies one local engine instance."""

    engine: str
    model: str
    device: str
    compute_type: str
    model_dir: str | None
    allow_download: bool

    def cache_key(self) -> tuple[Any, ...]:
        return (self.engine, self.model, self.device, self.compute_type, self.model_dir)


def _conf(key: str, default: Any) -> Any:
    """Read a Flask config value, tolerating no application context.

    Availability is queried from CLI commands and health checks that may run
    outside a request, and a missing context should give the defaults rather
    than an exception.
    """
    if has_app_context():
        return current_app.config.get(key, default)
    return default


def _local_settings() -> _LocalSettings:
    return _LocalSettings(
        engine=_conf("VOICE_LOCAL_ENGINE", "auto"),
        model=_conf("VOICE_LOCAL_MODEL", "base"),
        device=_conf("VOICE_LOCAL_DEVICE", "cpu"),
        compute_type=_conf("VOICE_LOCAL_COMPUTE_TYPE", "int8"),
        model_dir=_conf("VOICE_LOCAL_MODEL_DIR", None),
        allow_download=bool(_conf("VOICE_LOCAL_ALLOW_DOWNLOAD", False)),
    )


def ffmpeg_available() -> bool:
    """Whether an ``ffmpeg`` binary is on PATH.

    faster-whisper decodes through PyAV, which bundles the FFmpeg libraries and
    needs no binary. openai-whisper shells out to ``ffmpeg`` and is unusable
    without it, so this is checked rather than assumed before that engine is
    offered.
    """
    return shutil.which("ffmpeg") is not None


# --------------------------------------------------------------------------
# Input validation
# --------------------------------------------------------------------------


def _max_bytes() -> int:
    return int(_conf("VOICE_MAX_AUDIO_BYTES", DEFAULT_MAX_AUDIO_BYTES))


def _max_seconds() -> int:
    return int(_conf("VOICE_MAX_AUDIO_SECONDS", DEFAULT_MAX_AUDIO_SECONDS))


def _check_size(raw: bytes) -> None:
    if not raw:
        raise TranscriptionError("The recording is empty. Try recording again.")

    limit = _max_bytes()
    if len(raw) > limit:
        raise TranscriptionError(
            f"The recording is {len(raw) / 1048576:.1f} MB, over the "
            f"{limit / 1048576:.0f} MB limit. Record something shorter, or "
            f"raise VOICE_MAX_AUDIO_BYTES in the Zobi config."
        )


def _detect_format(raw: bytes, filename: str) -> str:
    """Identify the container from its magic bytes.

    Returns the extension the gateway should be told about. The filename is
    consulted only to choose between two spellings of the same container
    (``.m4a`` versus ``.mp4``), never to decide what the data is.
    """
    head = raw[:16]
    for offset, magic, name in _SIGNATURES:
        if head[offset : offset + len(magic)] == magic:
            if name == "mp4" and filename.lower().endswith(".m4a"):
                return "m4a"
            return name

    # A bare MPEG audio frame has no ID3 header: 11 set bits start the sync
    # word. Checked last because the pattern is short enough to collide.
    if len(head) >= 2 and head[0] == 0xFF and head[1] & 0xE0 == 0xE0:
        return "mp3"

    raise TranscriptionError(
        f"Unrecognised audio format. Supported: {', '.join(SUPPORTED_FORMATS)}."
    )


def _normalize_language(language: str | None) -> str | None:
    """Reduce a browser locale to the code Whisper expects.

    ``navigator.language`` yields tags like ``en-US``; Whisper wants the bare
    ISO-639-1 subtag. ``None`` means auto-detect, which is the default and the
    reason multilingual input works without the user choosing anything.
    """
    if not language:
        return None

    primary = language.strip().replace("_", "-").split("-")[0].lower()
    if not (2 <= len(primary) <= 3 and primary.isalpha()):
        raise TranscriptionError(
            f"'{language}' is not a language code. Use an ISO-639-1 code such "
            f"as 'en', 'ur' or 'ar', or leave it unset to auto-detect."
        )
    return primary


# --------------------------------------------------------------------------
# Local backend
# --------------------------------------------------------------------------


def _import_faster_whisper() -> Any | None:
    try:
        import faster_whisper  # noqa: PLC0415
    except ImportError:
        return None
    return faster_whisper


def _import_openai_whisper() -> Any | None:
    try:
        import whisper  # noqa: PLC0415
    except ImportError:
        return None
    return whisper


def _require(module: Any | None, package: str) -> Any:
    """Narrow a lazily imported module to non-None.

    The status checks refuse an engine whose package is missing, so a None here
    means one was selected anyway. Saying which package is absent beats the
    AttributeError that using it would otherwise raise.
    """
    if module is None:
        raise TranscriptionError(f"{package} is not installed")
    return module


def _faster_whisper_status(settings: _LocalSettings) -> tuple[bool, str]:
    """Can faster-whisper serve a request right now, without a download?

    Importability is not enough: the weights are fetched from Hugging Face on
    first use, and a 145 MB download inside a web worker would look like a hung
    request. Unless the operator opted into downloading, the model must already
    be on disk. The probe uses ``local_files_only`` so it never touches the
    network.
    """
    module = _import_faster_whisper()
    if module is None:
        return False, "faster-whisper is not installed"

    if settings.allow_download:
        return True, "faster-whisper installed, weights may be downloaded on first use"

    if os.path.isdir(settings.model):
        return True, f"faster-whisper model directory {settings.model}"

    try:
        module.download_model(
            settings.model,
            cache_dir=settings.model_dir,
            local_files_only=True,
        )
    except Exception:  # noqa: BLE001  # pylint: disable=broad-except
        return False, (
            f"faster-whisper is installed but the '{settings.model}' weights "
            f"are not on disk"
        )
    return True, f"faster-whisper '{settings.model}' weights present"


def _openai_whisper_status(settings: _LocalSettings) -> tuple[bool, str]:
    """Can openai-whisper serve a request right now?

    This engine shells out to ``ffmpeg`` for every decode, so a missing binary
    makes it useless however well the package imports.
    """
    module = _import_openai_whisper()
    if module is None:
        return False, "openai-whisper is not installed"
    if not ffmpeg_available():
        return False, "openai-whisper is installed but ffmpeg is not on PATH"

    if settings.allow_download:
        return True, "openai-whisper installed, weights may be downloaded on first use"

    root = settings.model_dir or os.path.join(
        os.path.expanduser("~"), ".cache", "whisper"
    )
    if os.path.exists(settings.model) or os.path.exists(
        os.path.join(root, f"{settings.model}.pt")
    ):
        return True, f"openai-whisper '{settings.model}' weights present"
    return False, (
        f"openai-whisper is installed but the '{settings.model}' weights are "
        f"not on disk"
    )


def _local_status(settings: _LocalSettings) -> tuple[str | None, str]:
    """Pick the local engine that can serve, or explain why none can.

    faster-whisper is tried first: it is several times faster on CPU, needs no
    ffmpeg binary, and its int8 weights are a fraction of the size.
    """
    checks = {
        _FASTER_WHISPER: _faster_whisper_status,
        _OPENAI_WHISPER: _openai_whisper_status,
    }
    if settings.engine != "auto":
        check = checks.get(settings.engine)
        if check is None:
            return None, f"unknown VOICE_LOCAL_ENGINE '{settings.engine}'"
        ok, detail = check(settings)
        return (settings.engine if ok else None), detail

    reasons = []
    for name, check in checks.items():
        ok, detail = check(settings)
        if ok:
            return name, detail
        reasons.append(detail)
    return None, "; ".join(reasons)


def _build_model(settings: _LocalSettings) -> Any:
    """Instantiate one engine. Slow, so only ever called under the lock."""
    if settings.engine == _FASTER_WHISPER:
        module = _require(_import_faster_whisper(), "faster-whisper")
        return module.WhisperModel(
            settings.model,
            device=settings.device,
            compute_type=settings.compute_type,
            download_root=settings.model_dir,
            local_files_only=not settings.allow_download,
        )

    module = _require(_import_openai_whisper(), "openai-whisper")
    return module.load_model(
        settings.model,
        device=settings.device,
        download_root=settings.model_dir,
    )


def _load_model(settings: _LocalSettings) -> Any:
    """Return the cached engine, loading it at most once per worker.

    Double-checked locking rather than a plain ``lru_cache``: several gunicorn
    threads can hit the microphone endpoint at the same moment on a cold
    worker, and without the lock each would spend seconds building its own copy
    of the weights. The unlocked read on the way in keeps the common case - a
    warm cache - off the lock entirely.

    Note for operators: the first request after a restart blocks other requests
    in that worker for as long as the load takes. Pre-warming by calling
    :func:`transcription_available` at boot is not enough; it deliberately does
    not load anything.
    """
    key = settings.cache_key()
    model = _MODELS.get(key)
    if model is not None:
        return model

    with _MODEL_LOCK:
        model = _MODELS.get(key)
        if model is None:
            logger.info("Loading local speech model %s (%s)", settings.model, key[0])
            model = _build_model(settings)
            _MODELS[key] = model
    return model


def _decode_faster_whisper(module: Any, raw: bytes) -> Any:
    try:
        return module.decode_audio(io.BytesIO(raw), sampling_rate=_SAMPLE_RATE)
    except Exception as ex:
        raise TranscriptionError(
            "Could not decode the recording. faster-whisper decodes through "
            "PyAV, so check that the 'av' package is installed and matches "
            "your faster-whisper version."
        ) from ex


def _run_faster_whisper(
    settings: _LocalSettings, raw: bytes, language: str | None
) -> dict[str, Any]:
    module = _import_faster_whisper()
    audio = _decode_faster_whisper(module, raw)
    _check_duration(len(audio) / _SAMPLE_RATE)

    model = _load_model(settings)
    segments, info = model.transcribe(audio, language=language, vad_filter=True)
    # ``segments`` is a generator; the work happens as it is consumed.
    text = "".join(segment.text for segment in segments).strip()
    return {
        "text": text,
        "language": getattr(info, "language", None) or language,
        "backend": "local",
    }


def _run_openai_whisper(
    settings: _LocalSettings, raw: bytes, ext: str, language: str | None
) -> dict[str, Any]:
    import tempfile  # noqa: PLC0415

    module = _require(_import_openai_whisper(), "openai-whisper")
    # load_audio takes a path because it hands the file to ffmpeg.
    with tempfile.NamedTemporaryFile(suffix=f".{ext}") as handle:
        handle.write(raw)
        handle.flush()
        try:
            audio = module.load_audio(handle.name)
        except Exception as ex:
            raise TranscriptionError(
                "Could not decode the recording. openai-whisper runs the "
                "ffmpeg binary, which "
                + ("is on PATH but failed." if ffmpeg_available() else "is missing.")
                + " Install ffmpeg, or switch to faster-whisper which needs no "
                "system binary."
            ) from ex

    _check_duration(len(audio) / _SAMPLE_RATE)
    model = _load_model(settings)
    result = model.transcribe(audio, language=language)
    return {
        "text": (result.get("text") or "").strip(),
        "language": result.get("language") or language,
        "backend": "local",
    }


def _check_duration(seconds: float) -> None:
    limit = _max_seconds()
    if seconds > limit:
        raise TranscriptionError(
            f"The recording is {seconds / 60:.1f} minutes, over the "
            f"{limit / 60:.0f} minute limit. Record something shorter, or "
            f"raise VOICE_MAX_AUDIO_SECONDS in the Zobi config."
        )


def _transcribe_local(
    settings: _LocalSettings,
    engine: str,
    raw: bytes,
    ext: str,
    language: str | None,
) -> dict[str, Any]:
    chosen = _LocalSettings(
        engine=engine,
        model=settings.model,
        device=settings.device,
        compute_type=settings.compute_type,
        model_dir=settings.model_dir,
        allow_download=settings.allow_download,
    )
    if engine == _FASTER_WHISPER:
        return _run_faster_whisper(chosen, raw, language)
    return _run_openai_whisper(chosen, raw, ext, language)


# --------------------------------------------------------------------------
# Gateway backend
# --------------------------------------------------------------------------


def _gateway_status() -> tuple[bool, str]:
    """Whether a transcription-capable model is configured.

    Resolution only reads the model tables, so this costs one small query and
    never calls the provider.
    """
    try:
        # Imported here, and inside the try, so that a status check outside an
        # application context degrades to "unavailable" instead of raising:
        # importing the model layer needs an initialised app.
        from zobi.llm import service  # noqa: PLC0415

        alias = service.resolve_alias("transcription")
    except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
        # Includes NoModelForCapabilityError, and any database problem: either
        # way the gateway cannot serve, and the reason belongs in the detail.
        return False, f"no gateway transcription model ({type(ex).__name__})"
    return True, f"gateway model '{alias}'"


def _transcribe_gateway(raw: bytes, ext: str, language: str | None) -> dict[str, Any]:
    # LiteLLM and the OpenAI SDK below it infer the container from the file
    # object's name, so the extension has to survive the trip.
    audio_file = io.BytesIO(raw)
    audio_file.name = f"audio.{ext}"

    kwargs: dict[str, Any] = {}
    if language:
        kwargs["language"] = language

    try:
        from zobi.llm import service  # noqa: PLC0415

        response = service.transcribe(audio_file, **kwargs)
    except TranscriptionError:
        raise
    except Exception as ex:  # noqa: BLE001  # pylint: disable=broad-except
        logger.warning("Gateway transcription failed: %s", type(ex).__name__)
        raise TranscriptionError(
            f"The transcription provider rejected the request "
            f"({type(ex).__name__}). Check the transcription model under "
            f"Manage > AI Models."
        ) from ex

    text = _response_field(response, "text")
    if text is None:
        raise TranscriptionError(
            "The transcription provider returned no text. Check that the "
            "model configured for transcription under Manage > AI Models is "
            "actually a speech-to-text model."
        )
    return {
        "text": text.strip(),
        "language": _response_field(response, "language") or language,
        "backend": "gateway",
    }


def _response_field(response: Any, field: str) -> Any:
    """Read a field from LiteLLM's response, object or dict shaped."""
    if isinstance(response, dict):
        return response.get(field)
    return getattr(response, field, None)


# --------------------------------------------------------------------------
# Public surface
# --------------------------------------------------------------------------


def _install_hint(local_detail: str, gateway_detail: str) -> str:
    return (
        f"No speech-to-text backend is available. Fix either one:\n"
        f"  local ({local_detail}): install the engine and pre-fetch a model, "
        f"e.g. `pip install faster-whisper` then "
        f'`python -c "from faster_whisper import download_model; '
        f"download_model('base')\"` inside the Zobi container. Set "
        f"VOICE_LOCAL_MODEL to pick a size (tiny/base/small/medium/large-v3).\n"
        f"  gateway ({gateway_detail}): add a model with the transcription "
        f"capability under Manage > AI Models and make it the transcription "
        f"default."
    )


def transcription_available() -> dict[str, Any]:
    """Report what could serve a transcription request right now.

    Cheap enough to call on every page load: it imports nothing heavy, loads no
    weights, and makes no network call. ``backend`` is the one that would
    actually be used, so a UI can show "on this machine" versus "sent to
    <provider>" honestly.
    """
    settings = _local_settings()
    preference = _conf("VOICE_BACKEND", "auto")

    local_engine, local_detail = (None, "disabled by VOICE_BACKEND")
    if preference in ("auto", "local"):
        local_engine, local_detail = _local_status(settings)

    gateway_ok, gateway_detail = (False, "disabled by VOICE_BACKEND")
    if preference in ("auto", "gateway"):
        gateway_ok, gateway_detail = _gateway_status()

    if local_engine:
        backend, detail = "local", local_detail
    elif gateway_ok:
        backend, detail = "gateway", gateway_detail
    else:
        backend, detail = None, _install_hint(local_detail, gateway_detail)

    return {
        "available": backend is not None,
        "backend": backend,
        "detail": detail,
        # Whisper covers these whichever backend runs it, and both auto-detect
        # when no hint is passed.
        "languages": _WHISPER_LANGUAGE_COUNT,
        "auto_detect": True,
        "formats": list(SUPPORTED_FORMATS),
        "max_bytes": _max_bytes(),
        "max_seconds": _max_seconds(),
        "ffmpeg": ffmpeg_available(),
    }


def transcribe_audio(
    raw: bytes,
    filename: str,
    language: str | None = None,
) -> dict[str, Any]:
    """Turn a browser recording into text.

    ``language`` is an optional ISO-639-1 hint (``en``, ``ur``, ``ar``); a
    browser locale like ``en-US`` is accepted and reduced. Leave it unset to
    let the model detect the language, which is the normal case and what makes
    multilingual input work without the user picking anything.

    Returns ``{"text": str, "language": str | None, "backend": str}`` where
    ``backend`` is ``"local"`` or ``"gateway"``. ``language`` is what the model
    detected, which may differ from the hint.

    Raises :class:`TranscriptionError` for anything a caller should show:
    oversized or unrecognised audio, no backend configured, or a backend that
    failed. The size cap is ``VOICE_MAX_AUDIO_BYTES`` and applies to every
    request; the duration cap is ``VOICE_MAX_AUDIO_SECONDS`` and applies to the
    local backend only, since the gateway path never decodes the audio and
    measuring it would mean decoding it twice.
    """
    _check_size(raw)
    ext = _detect_format(raw, filename)
    hint = _normalize_language(language)

    settings = _local_settings()
    preference = _conf("VOICE_BACKEND", "auto")

    local_engine, local_detail = (None, "disabled by VOICE_BACKEND")
    if preference in ("auto", "local"):
        local_engine, local_detail = _local_status(settings)

    if local_engine:
        result = _transcribe_local(settings, local_engine, raw, ext, hint)
    else:
        gateway_ok, gateway_detail = (False, "disabled by VOICE_BACKEND")
        if preference in ("auto", "gateway"):
            gateway_ok, gateway_detail = _gateway_status()
        if not gateway_ok:
            raise TranscriptionError(_install_hint(local_detail, gateway_detail))
        result = _transcribe_gateway(raw, ext, hint)

    # Size, format and detected language only. The transcript is the user's
    # speech and never reaches a log line, at any level.
    logger.info(
        "Transcribed %d bytes of %s via %s (language=%s)",
        len(raw),
        ext,
        result["backend"],
        result["language"],
    )
    return result


def reset_caches() -> None:
    """Drop cached engines. For tests, and for a config reload."""
    with _MODEL_LOCK:
        _MODELS.clear()


__all__ = [
    "DEFAULT_MAX_AUDIO_BYTES",
    "DEFAULT_MAX_AUDIO_SECONDS",
    "ffmpeg_available",
    "reset_caches",
    "SUPPORTED_FORMATS",
    "transcribe_audio",
    "TranscriptionError",
    "transcription_available",
]
