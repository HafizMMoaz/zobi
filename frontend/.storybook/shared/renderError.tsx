import { ReactNode } from 'react';
import { useTheme } from '@zobi.dev/extension-api/theme';

/**
 * Best-effort message extraction from whatever a failed request threw.
 *
 * The connection layer surfaces at least three shapes: a real `Error`, a
 * parsed JSON error body (`{ error }` or `{ message }`), and a bare `Response`
 * that never got parsed. Stories should not each re-derive this, so everything
 * funnels through here.
 */
function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const {
      error: nested,
      message,
      statusText,
    } = error as Record<string, unknown>;
    const candidate = nested ?? message ?? statusText;
    if (typeof candidate === 'string') return candidate;
  }

  return 'Unknown error';
}

/**
 * Split out as a component so the panel can read theme context. `renderError`
 * itself is called from inside render props, where hooks are not available.
 */
function ErrorPanel({ error }: { error: unknown }) {
  const theme = useTheme();

  return (
    <div
      style={{
        border: `1px solid ${theme.colorErrorBorder}`,
        borderRadius: 4,
        color: theme.colorError,
        fontSize: 13,
        padding: 12,
      }}
    >
      <strong>Request failed:</strong> {toMessage(error)}
      <pre style={{ fontSize: 11, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
        {/* `Error` keeps message/stack on the prototype, which JSON.stringify
            skips; passing the own-property list makes them serialise. */}
        {JSON.stringify(error, Object.getOwnPropertyNames(Object(error)), 2)}
      </pre>
    </div>
  );
}

/**
 * Uniform error panel for stories that talk to a live backend.
 *
 * Returns a node rather than a component because callers use it inside render
 * props as an early return (`if (error) return renderError(error);`), where a
 * JSX element reads better than another wrapper component.
 */
export default function renderError(error: unknown): ReactNode {
  return <ErrorPanel error={error} />;
}
