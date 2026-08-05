import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, keyframes, styled } from '@zobi.dev/extension-api/theme';
import { Button } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import { describeApiError } from '../llm/errors';
import { transcribeAudio } from './api';

/**
 * Hard stop for a single recording.
 *
 * Without one, a mic left on by accident produces a clip that is slow to
 * upload and expensive to transcribe, and the user gets no signal until both
 * have already happened.
 */
const MAX_RECORDING_SECONDS = 300;

/**
 * Container preferences, best first.
 *
 * Opus in WebM is what the transcription backends handle most cheaply. Safari
 * has historically only produced MP4/AAC, so it is kept as a fallback rather
 * than treated as an unsupported browser.
 */
const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

const EXTENSIONS: [string, string][] = [
  ['webm', 'webm'],
  ['ogg', 'ogg'],
  ['mp4', 'm4a'],
  ['mpeg', 'mp3'],
  ['wav', 'wav'],
];

type RecorderState = 'idle' | 'recording' | 'transcribing';

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.25; }
  100% { opacity: 1; }
`;

const Wrapper = styled.div`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    gap: ${theme.sizeUnit}px;
    flex-shrink: 0;
  `}
`;

const Status = styled.span`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    gap: ${theme.sizeUnit}px;
    font-size: ${theme.fontSizeSM}px;
    color: ${theme.colorTextSecondary};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  `}
`;

const Dot = styled.span`
  ${({ theme }) => css`
    width: ${theme.sizeUnit * 2}px;
    height: ${theme.sizeUnit * 2}px;
    border-radius: 50%;
    background: ${theme.colorError};
    animation: ${pulse} 1.2s ease-in-out infinite;
  `}
`;

const pickMimeType = (): string | undefined =>
  PREFERRED_MIME_TYPES.find(type =>
    typeof MediaRecorder.isTypeSupported === 'function'
      ? MediaRecorder.isTypeSupported(type)
      : false,
  );

const extensionFor = (mimeType: string): string =>
  EXTENSIONS.find(([token]) => mimeType.includes(token))?.[1] ?? 'webm';

const formatElapsed = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

interface VoiceInputProps {
  /**
   * Receives the transcript. Deliberately not a send: speech recognition
   * misreads names and numbers, and the user needs the chance to fix it.
   */
  onTranscript: (text: string) => void;
  /** Reports a failure to the panel, which owns the visible error area. */
  onError: (message: string) => void;
  disabled?: boolean;
}

const VoiceInput: FunctionComponent<VoiceInputProps> = ({
  onTranscript,
  onError,
  disabled = false,
}) => {
  const [state, setState] = useState<RecorderState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [failure, setFailure] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // Read through refs inside recorder callbacks: those callbacks are attached
  // once when recording starts and would otherwise keep calling the versions
  // of these props that existed at that moment.
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  /**
   * Stop every track and forget the stream.
   *
   * This has to happen on every exit path, not just the happy one. A live
   * getUserMedia stream keeps the browser's recording indicator lit and the OS
   * microphone light on, which looks exactly like an application that is still
   * listening after it said it had stopped.
   */
  const releaseMicrophone = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }, []);

  const stopTimer = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const fail = useCallback((message: string) => {
    setFailure(message);
    onErrorRef.current(message);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopTimer();
      const recorder = recorderRef.current;
      if (recorder) {
        // Detach first: onstop would otherwise start an upload and set state
        // on a component that is already gone.
        recorder.onstop = null;
        recorder.ondataavailable = null;
        recorder.onerror = null;
        if (recorder.state !== 'inactive') recorder.stop();
        recorderRef.current = null;
      }
      releaseMicrophone();
    };
  }, [releaseMicrophone, stopTimer]);

  /** Runs once the recorder has flushed its last chunk. */
  const finish = useCallback(async () => {
    releaseMicrophone();
    stopTimer();

    const chunks = chunksRef.current;
    chunksRef.current = [];
    const recorded = recorderRef.current;
    recorderRef.current = null;

    const mimeType = recorded?.mimeType || 'audio/webm';
    const clip = new Blob(chunks, { type: mimeType });

    if (!clip.size) {
      if (mountedRef.current) setState('idle');
      fail(
        t(
          'Nothing was recorded. Check that the microphone you expect is the ' +
            'one your browser is using.',
        ),
      );
      return;
    }

    if (mountedRef.current) setState('transcribing');
    try {
      const result = await transcribeAudio(
        clip,
        `recording.${extensionFor(mimeType)}`,
      );
      if (!mountedRef.current) return;
      const text = result.text?.trim();
      if (text) {
        setFailure(null);
        onTranscriptRef.current(text);
      } else {
        fail(t('No speech was recognised in that recording.'));
      }
    } catch (error) {
      if (!mountedRef.current) return;
      // describeApiError carries the server's own wording through, which is
      // what makes the 503 useful: it names the transcription backend that is
      // missing instead of just saying transcription failed.
      fail(
        await describeApiError(
          error,
          t('That recording could not be transcribed.'),
        ),
      );
    } finally {
      if (mountedRef.current) setState('idle');
    }
  }, [fail, releaseMicrophone, stopTimer]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      // finish() runs from onstop, once the final chunk has arrived.
      recorder.stop();
      return;
    }
    releaseMicrophone();
    stopTimer();
    setState('idle');
  }, [releaseMicrophone, stopTimer]);

  const start = useCallback(async () => {
    setFailure(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      fail(
        t(
          'This page cannot reach the microphone. Recording needs a secure ' +
            '(https) connection and a browser that supports getUserMedia.',
        ),
      );
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      fail(
        t(
          'This browser cannot record audio: it has no MediaRecorder support. ' +
            'Try a current version of Chrome, Edge, Firefox or Safari.',
        ),
      );
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      const name = (error as DOMException)?.name;
      if (
        name === 'NotAllowedError' ||
        name === 'PermissionDeniedError' ||
        name === 'SecurityError'
      ) {
        fail(
          t(
            'Microphone access was denied. Allow it for this site in your ' +
              'browser settings, then try again.',
          ),
        );
      } else if (
        name === 'NotFoundError' ||
        name === 'DevicesNotFoundError' ||
        name === 'OverconstrainedError'
      ) {
        fail(t('No microphone was found. Connect one and try again.'));
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        fail(t('The microphone is in use by another application right now.'));
      } else {
        fail((error as Error)?.message || t('Could not start recording.'));
      }
      return;
    }

    // An unmount can land while the permission prompt is open. Handing the
    // stream straight back is the only way to take the recording indicator
    // down again.
    if (!mountedRef.current) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch (error) {
      releaseMicrophone();
      fail(
        (error as Error)?.message ||
          t('This browser cannot record audio in a format Zobi can read.'),
      );
      return;
    }

    recorder.ondataavailable = event => {
      if (event.data?.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      finish();
    };
    recorder.onerror = () => {
      releaseMicrophone();
      stopTimer();
      recorderRef.current = null;
      setState('idle');
      fail(t('Recording stopped unexpectedly.'));
    };

    recorderRef.current = recorder;
    recorder.start();
    setSeconds(0);
    setState('recording');
    tickRef.current = window.setInterval(() => {
      setSeconds(current => current + 1);
    }, 1000);
  }, [fail, finish, releaseMicrophone, stopTimer]);

  // Enforce the cap as an effect rather than from inside the timer tick, so
  // stopping stays out of a state updater.
  useEffect(() => {
    if (state === 'recording' && seconds >= MAX_RECORDING_SECONDS) stop();
  }, [seconds, state, stop]);

  if (state === 'recording') {
    return (
      <Wrapper>
        <Status>
          <Dot />
          {formatElapsed(seconds)}
        </Status>
        <Button
          buttonStyle="danger"
          aria-label={t('Stop recording')}
          tooltip={t('Stop recording and transcribe')}
          icon={<Icons.StopOutlined />}
          onClick={stop}
        />
      </Wrapper>
    );
  }

  if (state === 'transcribing') {
    return (
      <Wrapper>
        <Status>{t('Transcribing...')}</Status>
        <Button
          buttonStyle="tertiary"
          disabled
          aria-label={t('Transcribing')}
          icon={<Icons.LoadingOutlined />}
        />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Button
        buttonStyle="tertiary"
        disabled={disabled}
        aria-label={t('Record a voice message')}
        tooltip={failure ?? t('Record a voice message')}
        icon={failure ? <Icons.WarningOutlined /> : <Icons.CircleSolid />}
        onClick={start}
      />
    </Wrapper>
  );
};

export default VoiceInput;
