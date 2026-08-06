import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ZobiClient } from '@zobi.dev/core';
import renderError from './renderError';

export type VerifyCORSMethod = 'GET' | 'POST';

export interface VerifyCORSProps {
  /** Rendered only once the round trip succeeds. */
  children: (result: { payload?: unknown }) => ReactNode;
  /** Omit to verify authentication only, without hitting a data endpoint. */
  endpoint?: string;
  /** Zobi backend to reach, e.g. `localhost:8088`. */
  host: string;
  method?: VerifyCORSMethod;
  /** JSON string; ignored for GET and when unparseable. */
  postPayload?: string;
}

type Status = 'loading' | 'success' | 'error';

/**
 * Storybook controls hand us plain strings, and an empty or interpolated
 * `undefined` is normal mid-edit. Treat anything unparseable as "no body"
 * rather than failing the request for a reason unrelated to CORS.
 */
function parsePayload(raw?: string): Record<string, unknown> | undefined {
  if (!raw || raw === 'undefined') return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * Live check that a Zobi backend is reachable from the Storybook origin.
 *
 * Storybook runs on :6006 while the backend runs elsewhere, so every story
 * that fetches real data depends on CORS and session cookies being configured
 * on the server. This isolates that failure mode: when the request fails you
 * see a CORS/auth error here instead of an empty chart with no explanation.
 *
 * The client is reset before each attempt because it is a module-level
 * singleton - without the reset, changing `host` in the controls would keep
 * talking to whichever host configured it first.
 */
export default function VerifyCORS({
  children,
  endpoint,
  host,
  method = 'POST',
  postPayload,
}: VerifyCORSProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [payload, setPayload] = useState<unknown>();
  const [error, setError] = useState<unknown>();

  const runRequest = useCallback(async () => {
    setStatus('loading');
    setError(undefined);
    setPayload(undefined);

    try {
      ZobiClient.reset();
      ZobiClient.configure({ credentials: 'include', host, mode: 'cors' });
      await ZobiClient.init();

      if (!endpoint) {
        setStatus('success');
        return;
      }

      const body = parsePayload(postPayload);
      const response =
        method === 'POST'
          ? await ZobiClient.post({ endpoint, postPayload: body })
          : await ZobiClient.get({ endpoint });

      setPayload((response as { json?: unknown })?.json ?? response);
      setStatus('success');
    } catch (caught) {
      setError(caught);
      setStatus('error');
    }
  }, [endpoint, host, method, postPayload]);

  // Re-runs whenever the controls change, which is what the story's "update
  // controls below to try again" copy promises. `status` is genuine async
  // state - it cannot be computed during render, since it depends on a network
  // round trip that has not happened yet.
  /* eslint-disable react-you-might-not-need-an-effect/no-derived-state */
  useEffect(() => {
    runRequest();
  }, [runRequest]);
  /* eslint-enable react-you-might-not-need-an-effect/no-derived-state */

  if (status === 'loading') return <div>Checking {host}…</div>;

  if (status === 'error')
    return (
      <div>
        {renderError(error)}
        <button type="button" onClick={runRequest} style={{ marginTop: 8 }}>
          Try again
        </button>
      </div>
    );

  return <>{children({ payload })}</>;
}
