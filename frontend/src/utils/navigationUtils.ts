import { ensureAppRoot } from './pathUtils';

export const navigateTo = (
  url: string,
  options?: { newWindow?: boolean; assign?: boolean },
) => {
  if (options?.newWindow) {
    window.open(ensureAppRoot(url), '_blank', 'noopener noreferrer');
  } else if (options?.assign) {
    window.location.assign(ensureAppRoot(url));
  } else {
    window.location.href = ensureAppRoot(url);
  }
};

export const navigateWithState = (
  url: string,
  state: Record<string, unknown>,
  options?: { replace?: boolean },
) => {
  if (options?.replace) {
    window.history.replaceState(state, '', ensureAppRoot(url));
  } else {
    window.history.pushState(state, '', ensureAppRoot(url));
  }
};
