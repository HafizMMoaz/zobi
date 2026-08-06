"""Tests for speech to text.

No test loads a model or touches a network. Both backends are mocked at the
seam where the real engine would be imported, so these run in milliseconds on a
machine with neither faster-whisper nor an LLM provider configured.

Two properties matter more than the rest and are tested hardest: that audio
goes to the local engine when one exists rather than being uploaded to a
provider, and that the transcript never reaches a log.
"""

from collections.abc import Iterator
from typing import Any

import pytest
from flask import current_app
from pytest_mock import MockerFixture

from zobi.agent import voice

#: A minimal but genuine EBML header - what a Chrome MediaRecorder blob starts
#: with. The module sniffs magic bytes, so tests need real ones.
WEBM = b"\x1a\x45\xdf\xa3" + b"\x00" * 60
MP4 = b"\x00\x00\x00\x20ftypisom" + b"\x00" * 60
OGG = b"OggS" + b"\x00" * 60
WAV = b"RIFF\x00\x00\x00\x00WAVE" + b"\x00" * 60


@pytest.fixture(autouse=True)
def _clean_caches() -> Iterator[None]:
    voice.reset_caches()
    yield
    voice.reset_caches()


@pytest.fixture
def no_local(mocker: MockerFixture) -> None:
    """No local engine can serve."""
    mocker.patch.object(
        voice, "_local_status", return_value=(None, "faster-whisper is not installed")
    )


@pytest.fixture
def local_ready(mocker: MockerFixture) -> None:
    """faster-whisper is installed with weights on disk."""
    mocker.patch.object(
        voice,
        "_local_status",
        return_value=(voice._FASTER_WHISPER, "faster-whisper 'base' weights present"),
    )


@pytest.fixture
def no_gateway(mocker: MockerFixture) -> None:
    mocker.patch.object(
        voice, "_gateway_status", return_value=(False, "no gateway transcription model")
    )


@pytest.fixture
def gateway_ready(mocker: MockerFixture) -> None:
    mocker.patch.object(
        voice, "_gateway_status", return_value=(True, "gateway model 'whisper-1'")
    )


class _FakeSegment:
    def __init__(self, text: str) -> None:
        self.text = text


class _FakeInfo:
    def __init__(self, language: str) -> None:
        self.language = language


class _FakeAudio:
    """Stands in for the decoded waveform without allocating one.

    ``_run_faster_whisper`` only measures it, so a length is all it needs.
    """

    def __init__(self, seconds: float) -> None:
        self._frames = int(seconds * 16000)

    def __len__(self) -> int:
        return self._frames


def _fake_faster_whisper(
    mocker: MockerFixture,
    text: str = "hello there",
    language: str = "en",
    seconds: float = 3.0,
) -> Any:
    """Install a stand-in faster_whisper module and return it."""
    module = mocker.Mock()
    module.decode_audio.return_value = _FakeAudio(seconds)
    model = mocker.Mock()
    model.transcribe.return_value = ([_FakeSegment(text)], _FakeInfo(language))
    module.WhisperModel.return_value = model
    mocker.patch.object(voice, "_import_faster_whisper", return_value=module)
    return module


def _fake_gateway(
    mocker: MockerFixture, text: str = "from the provider", language: str = "en"
) -> Any:
    service = mocker.patch("zobi.llm.service.transcribe")
    service.return_value = mocker.Mock(text=text, language=language)
    return service


# --------------------------------------------------------------------------
# Backend selection
# --------------------------------------------------------------------------


@pytest.mark.usefixtures("local_ready", "gateway_ready")
def test_local_is_preferred_over_the_gateway(mocker: MockerFixture) -> None:
    """Audio must not leave the machine when something here can transcribe it.

    Both backends are available; the local one has to win, and the gateway must
    not be called at all.
    """
    _fake_faster_whisper(mocker, text="local said this")
    gateway = _fake_gateway(mocker)

    result = voice.transcribe_audio(WEBM, "recording.webm")

    assert result == {
        "text": "local said this",
        "language": "en",
        "backend": "local",
    }
    gateway.assert_not_called()


@pytest.mark.usefixtures("no_local", "gateway_ready")
def test_falls_back_to_the_gateway_when_no_local_engine(
    mocker: MockerFixture,
) -> None:
    gateway = _fake_gateway(mocker, text=" spaced out ", language="ur")

    result = voice.transcribe_audio(WEBM, "recording.webm")

    assert result == {"text": "spaced out", "language": "ur", "backend": "gateway"}
    sent = gateway.call_args.args[0]
    # LiteLLM infers the container from the name, so it has to survive.
    assert sent.name == "audio.webm"
    assert sent.read() == WEBM


@pytest.mark.usefixtures("no_local", "no_gateway")
def test_error_names_the_fix_when_nothing_can_serve() -> None:
    """An operator reading this should not have to guess what to install."""
    with pytest.raises(voice.TranscriptionError) as excinfo:
        voice.transcribe_audio(WEBM, "recording.webm")

    message = str(excinfo.value)
    assert "pip install faster-whisper" in message
    assert "AI Models" in message


@pytest.mark.usefixtures("local_ready", "gateway_ready")
def test_forcing_the_gateway_skips_the_local_engine(mocker: MockerFixture) -> None:
    mocker.patch.dict(current_app.config, {"VOICE_BACKEND": "gateway"})
    local = mocker.patch.object(voice, "_transcribe_local")
    _fake_gateway(mocker)

    assert voice.transcribe_audio(WEBM, "r.webm")["backend"] == "gateway"
    local.assert_not_called()


@pytest.mark.usefixtures("local_ready", "gateway_ready")
def test_local_failure_is_not_quietly_sent_to_the_gateway(
    mocker: MockerFixture,
) -> None:
    """A broken local engine must not become an unannounced upload.

    The operator chose local so the recording stays put; falling through to a
    third party on error would defeat that silently.
    """
    mocker.patch.object(
        voice,
        "_transcribe_local",
        side_effect=voice.TranscriptionError("decode blew up"),
    )
    gateway = _fake_gateway(mocker)

    with pytest.raises(voice.TranscriptionError, match="decode blew up"):
        voice.transcribe_audio(WEBM, "r.webm")
    gateway.assert_not_called()


@pytest.mark.usefixtures("no_local", "gateway_ready")
def test_gateway_errors_become_actionable_messages(mocker: MockerFixture) -> None:
    mocker.patch("zobi.llm.service.transcribe", side_effect=RuntimeError("401"))

    with pytest.raises(voice.TranscriptionError) as excinfo:
        voice.transcribe_audio(WEBM, "r.webm")
    assert "AI Models" in str(excinfo.value)


# --------------------------------------------------------------------------
# Bounds
# --------------------------------------------------------------------------


@pytest.mark.usefixtures("local_ready", "gateway_ready")
def test_oversized_audio_is_rejected_before_any_backend_runs(
    mocker: MockerFixture,
) -> None:
    local = mocker.patch.object(voice, "_transcribe_local")
    gateway = _fake_gateway(mocker)
    mocker.patch.dict(current_app.config, {"VOICE_MAX_AUDIO_BYTES": 1024})

    with pytest.raises(voice.TranscriptionError) as excinfo:
        voice.transcribe_audio(WEBM + b"\x00" * 2048, "r.webm")

    assert "VOICE_MAX_AUDIO_BYTES" in str(excinfo.value)
    local.assert_not_called()
    gateway.assert_not_called()


@pytest.mark.usefixtures("local_ready")
def test_empty_recording_is_rejected() -> None:
    with pytest.raises(voice.TranscriptionError, match="empty"):
        voice.transcribe_audio(b"", "r.webm")


@pytest.mark.usefixtures("local_ready")
def test_over_long_audio_is_rejected_after_decoding(mocker: MockerFixture) -> None:
    """Bytes are a poor proxy for minutes, so length is checked once decoded."""
    module = _fake_faster_whisper(mocker, seconds=3600)
    mocker.patch.dict(current_app.config, {"VOICE_MAX_AUDIO_SECONDS": 60})

    with pytest.raises(voice.TranscriptionError) as excinfo:
        voice.transcribe_audio(WEBM, "r.webm")

    assert "VOICE_MAX_AUDIO_SECONDS" in str(excinfo.value)
    module.WhisperModel.assert_not_called()


@pytest.mark.usefixtures("local_ready", "gateway_ready")
def test_unrecognised_container_is_refused(mocker: MockerFixture) -> None:
    """A .webm name on arbitrary bytes must not be believed."""
    local = mocker.patch.object(voice, "_transcribe_local")

    with pytest.raises(voice.TranscriptionError, match="Unrecognised audio format"):
        voice.transcribe_audio(b"not audio at all, whatever the name says", "r.webm")
    local.assert_not_called()


@pytest.mark.parametrize(
    "raw,filename,expected",
    [
        # What Chrome and Edge MediaRecorder produce.
        (WEBM, "recording.webm", "webm"),
        # Firefox can emit ogg/opus.
        (OGG, "recording.ogg", "ogg"),
        # Safari emits mp4/aac, under either spelling.
        (MP4, "recording.mp4", "mp4"),
        (MP4, "recording.m4a", "m4a"),
        (WAV, "recording.wav", "wav"),
        # The bytes decide, not the name.
        (WEBM, "recording.mp3", "webm"),
    ],
)
def test_browser_formats_are_detected_from_the_bytes(
    raw: bytes, filename: str, expected: str
) -> None:
    assert voice._detect_format(raw, filename) == expected


# --------------------------------------------------------------------------
# Language
# --------------------------------------------------------------------------


@pytest.mark.usefixtures("local_ready")
def test_language_is_auto_detected_when_no_hint_is_given(
    mocker: MockerFixture,
) -> None:
    """The multilingual case: the user says nothing, the model decides."""
    module = _fake_faster_whisper(mocker, text="مرحبا", language="ar")

    result = voice.transcribe_audio(WEBM, "r.webm")

    assert result["language"] == "ar"
    assert (
        module.WhisperModel.return_value.transcribe.call_args.kwargs["language"] is None
    )


@pytest.mark.usefixtures("local_ready")
@pytest.mark.parametrize(
    "given,passed", [("ur", "ur"), ("en-US", "en"), ("pt_BR", "pt")]
)
def test_browser_locales_are_reduced_to_language_codes(
    mocker: MockerFixture, given: str, passed: str
) -> None:
    module = _fake_faster_whisper(mocker)

    voice.transcribe_audio(WEBM, "r.webm", language=given)

    call = module.WhisperModel.return_value.transcribe.call_args
    assert call.kwargs["language"] == passed


@pytest.mark.usefixtures("no_local", "gateway_ready")
def test_the_gateway_gets_the_hint_only_when_there_is_one(
    mocker: MockerFixture,
) -> None:
    gateway = _fake_gateway(mocker)

    voice.transcribe_audio(WEBM, "r.webm")
    assert "language" not in gateway.call_args.kwargs

    voice.transcribe_audio(WEBM, "r.webm", language="fr-CA")
    assert gateway.call_args.kwargs["language"] == "fr"


@pytest.mark.usefixtures("local_ready")
def test_a_nonsense_language_hint_is_refused() -> None:
    with pytest.raises(voice.TranscriptionError, match="ISO-639-1"):
        voice.transcribe_audio(WEBM, "r.webm", language="!!")


# --------------------------------------------------------------------------
# Model caching
# --------------------------------------------------------------------------


@pytest.mark.usefixtures("local_ready")
def test_the_model_is_loaded_once_and_reused(mocker: MockerFixture) -> None:
    """Loading is seconds of CPU; doing it per request would be unusable."""
    module = _fake_faster_whisper(mocker)

    for _ in range(3):
        voice.transcribe_audio(WEBM, "r.webm")

    module.WhisperModel.assert_called_once()


@pytest.mark.usefixtures("local_ready")
def test_concurrent_first_requests_load_the_model_once(
    mocker: MockerFixture,
) -> None:
    """A cold worker hit by several threads must not build several engines."""
    import threading

    module = _fake_faster_whisper(mocker)
    start = threading.Barrier(4)
    app = current_app._get_current_object()  # noqa: SLF001

    def worker() -> None:
        with app.app_context():
            start.wait()
            voice.transcribe_audio(WEBM, "r.webm")

    threads = [threading.Thread(target=worker) for _ in range(4)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    module.WhisperModel.assert_called_once()


# --------------------------------------------------------------------------
# Privacy
# --------------------------------------------------------------------------


@pytest.mark.usefixtures("local_ready")
def test_neither_the_transcript_nor_the_audio_is_logged(
    mocker: MockerFixture, caplog: pytest.LogCaptureFixture
) -> None:
    """What the user said is theirs, at every log level."""
    # Deliberately the kind of thing somebody dictates and would hate to find
    # in a log file. Not a credential; S105 sees the word "password".
    secret = "my password is hunter2 and the merger closes friday"  # noqa: S105
    _fake_faster_whisper(mocker, text=secret)
    audio = WEBM + b"SENSITIVE-WAVEFORM-BYTES" + b"\x00" * 32

    with caplog.at_level("DEBUG"):
        result = voice.transcribe_audio(audio, "r.webm")

    assert result["text"] == secret
    assert secret not in caplog.text
    assert "hunter2" not in caplog.text
    assert "SENSITIVE-WAVEFORM-BYTES" not in caplog.text


@pytest.mark.usefixtures("no_local", "gateway_ready")
def test_a_failing_gateway_does_not_log_the_audio(
    mocker: MockerFixture, caplog: pytest.LogCaptureFixture
) -> None:
    mocker.patch("zobi.llm.service.transcribe", side_effect=RuntimeError("boom"))
    audio = WEBM + b"SENSITIVE-WAVEFORM-BYTES"

    with caplog.at_level("DEBUG"), pytest.raises(voice.TranscriptionError):
        voice.transcribe_audio(audio, "r.webm")

    assert "SENSITIVE-WAVEFORM-BYTES" not in caplog.text


# --------------------------------------------------------------------------
# Availability reporting
# --------------------------------------------------------------------------


@pytest.mark.usefixtures("local_ready", "gateway_ready")
def test_availability_reports_the_backend_that_would_actually_run() -> None:
    status = voice.transcription_available()

    assert status["available"] is True
    assert status["backend"] == "local"
    assert status["auto_detect"] is True
    assert status["languages"] > 1
    assert "webm" in status["formats"]
    assert status["max_bytes"] == voice.DEFAULT_MAX_AUDIO_BYTES


@pytest.mark.usefixtures("no_local", "gateway_ready")
def test_availability_reports_the_gateway_when_local_is_missing() -> None:
    assert voice.transcription_available()["backend"] == "gateway"


@pytest.mark.usefixtures("no_local", "no_gateway")
def test_availability_explains_how_to_fix_an_unavailable_setup() -> None:
    status = voice.transcription_available()

    assert status["available"] is False
    assert status["backend"] is None
    assert "pip install faster-whisper" in status["detail"]


@pytest.mark.usefixtures("local_ready", "gateway_ready")
def test_availability_loads_no_model(mocker: MockerFixture) -> None:
    """It is called on page load, so it must stay cheap."""
    build = mocker.patch.object(voice, "_build_model")

    voice.transcription_available()

    build.assert_not_called()


def test_availability_never_reaches_the_network(mocker: MockerFixture) -> None:
    """The local probe must be a filesystem check, not a download.

    A cold probe that fetched weights would turn a page load into a 145 MB
    download.
    """
    module = mocker.Mock()
    mocker.patch.object(voice, "_import_faster_whisper", return_value=module)
    mocker.patch.object(voice, "_gateway_status", return_value=(False, "none"))

    voice.transcription_available()

    assert module.download_model.call_args.kwargs["local_files_only"] is True


# --------------------------------------------------------------------------
# Local engine selection
# --------------------------------------------------------------------------


def test_openai_whisper_is_not_offered_without_ffmpeg(mocker: MockerFixture) -> None:
    """That engine shells out to ffmpeg, so it is useless without the binary."""
    mocker.patch.object(voice, "_import_faster_whisper", return_value=None)
    mocker.patch.object(voice, "_import_openai_whisper", return_value=mocker.Mock())
    mocker.patch.object(voice, "ffmpeg_available", return_value=False)

    engine, detail = voice._local_status(voice._local_settings())

    assert engine is None
    assert "ffmpeg" in detail


def test_local_is_unavailable_when_weights_are_absent(mocker: MockerFixture) -> None:
    """Importable is not the same as usable, and must not be reported as such."""
    module = mocker.Mock()
    module.download_model.side_effect = OSError("not cached")
    mocker.patch.object(voice, "_import_faster_whisper", return_value=module)
    mocker.patch.object(voice, "_import_openai_whisper", return_value=None)

    engine, detail = voice._local_status(voice._local_settings())

    assert engine is None
    assert "not on disk" in detail
