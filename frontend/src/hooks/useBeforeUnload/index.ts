import { useEffect } from 'react';

/**
 * Custom hook to handle browser navigation/reload with unsaved changes
 * @param shouldWarn - Boolean indicating if there are unsaved changes
 * @param message - Optional custom message (most browsers ignore this and show their own)
 */
export const useBeforeUnload = (
  shouldWarn: boolean,
  message?: string,
): void => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldWarn) return;

      event.preventDefault();
      // Most browsers require returnValue to be set, even though they ignore custom messages
      // eslint-disable-next-line no-param-reassign
      event.returnValue = message || '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldWarn, message]);
};
