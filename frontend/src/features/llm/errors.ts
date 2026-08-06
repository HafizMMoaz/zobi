import { getClientErrorObject } from '@zobi.dev/core';
import { t } from '@zobi.dev/extension-api/translation';

/**
 * Pull the server's actual message out of a failed ZobiClient call.
 *
 * The gateway's first version showed a fixed string like "There was an issue
 * creating the provider." for every failure. When provider creation started
 * returning a 500, that message was all anyone saw: the real cause was a
 * TypeError raised while decoding an encrypted column, and it never reached
 * the browser. Debugging it meant reading container logs.
 *
 * Validation errors matter just as much: a 400 from the schema carries a
 * per-field explanation that the operator needs in order to fix their input.
 *
 * @param error the rejection from a ZobiClient call
 * @param fallback shown only when the response carries nothing useful
 */
export async function describeApiError(
  error: unknown,
  fallback: string,
): Promise<string> {
  try {
    const parsed = await getClientErrorObject(
      error as Parameters<typeof getClientErrorObject>[0],
    );

    // Marshmallow validation errors arrive as {field: [messages]}. Flatten to
    // "field: message" so the operator knows which input to correct.
    if (parsed?.message && typeof parsed.message === 'object') {
      const parts = Object.entries(parsed.message).map(([field, messages]) =>
        Array.isArray(messages)
          ? `${field}: ${messages.join(' ')}`
          : `${field}: ${String(messages)}`,
      );
      if (parts.length) return parts.join('; ');
    }

    if (typeof parsed?.message === 'string' && parsed.message) {
      return parsed.message;
    }
    if (parsed?.error) return String(parsed.error);
  } catch {
    // Falling through to the caller's message is the right behaviour here:
    // failing to parse an error must not replace it with a parser error.
  }
  return fallback;
}

/** Suffix used when a fallback is shown, pointing at where the detail lives. */
export const CHECK_LOGS_HINT = t('Check the server logs for details.');
