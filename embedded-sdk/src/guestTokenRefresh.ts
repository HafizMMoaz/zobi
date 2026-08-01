import { jwtDecode } from "jwt-decode";

export const REFRESH_TIMING_BUFFER_MS = 5000 // refresh guest token early to avoid failed zobi requests
export const MIN_REFRESH_WAIT_MS = 10000 // avoid blasting requests as fast as the cpu can handle
export const DEFAULT_TOKEN_EXP_MS = 300000 // (5 min) used only when parsing guest token exp fails

// when do we refresh the guest token?
export function getGuestTokenRefreshTiming(currentGuestToken: string) {
  const parsedJwt = jwtDecode<Record<string, any>>(currentGuestToken);
  // if exp is int, it is in seconds, but Date() takes milliseconds
  const exp = new Date(/[^0-9\.]/g.test(parsedJwt.exp) ? parsedJwt.exp : parseFloat(parsedJwt.exp) * 1000);
  const isValidDate = exp.toString() !== 'Invalid Date';
  const ttl = isValidDate ? Math.max(MIN_REFRESH_WAIT_MS, exp.getTime() - Date.now()) : DEFAULT_TOKEN_EXP_MS;
  return ttl - REFRESH_TIMING_BUFFER_MS;
}
