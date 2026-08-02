import { ZobiClient, ClientConfig } from '@zobi.dev/core';
import { logging } from '@zobi.dev/extension-api/utils';
import parseCookie from 'src/utils/parseCookie';
import getBootstrapData from 'src/utils/getBootstrapData';

const bootstrapData = getBootstrapData();

function getDefaultConfiguration(): ClientConfig {
  const csrfNode = document.querySelector<HTMLInputElement>('#csrf_token');
  const csrfToken = csrfNode?.value;

  // when using flask-jwt-extended csrf is set in cookies
  const jwtAccessCsrfCookieName =
    bootstrapData.common.conf.JWT_ACCESS_CSRF_COOKIE_NAME;
  const cookieCSRFToken = parseCookie()[jwtAccessCsrfCookieName] || '';

  // Configure retry behavior from backend settings
  const retryConfig = bootstrapData.common.conf;

  // Create exponential backoff delay function with jitter
  const createRetryDelayFunction = () => {
    const baseDelay = retryConfig.ZOBI_CLIENT_RETRY_DELAY || 1000;
    const multiplier = retryConfig.ZOBI_CLIENT_RETRY_BACKOFF_MULTIPLIER || 2;
    const maxDelay = retryConfig.ZOBI_CLIENT_RETRY_MAX_DELAY || 10000;

    return (attempt: number) => {
      // Calculate exponential backoff: baseDelay * Math.pow(multiplier, attempt)
      const safeAttempt = Math.min(attempt, 10); // Limit attempt to prevent overflow
      const exponentialDelay = baseDelay * Math.pow(multiplier, safeAttempt);

      // Apply max delay cap
      const cappedDelay = Math.min(exponentialDelay, maxDelay);

      // Add random jitter to prevent thundering herd
      const jitter = Math.random() * cappedDelay;

      return cappedDelay + jitter;
    };
  };

  const fetchRetryOptions = {
    retries: retryConfig.ZOBI_CLIENT_RETRY_ATTEMPTS || 3,
    retryDelay: createRetryDelayFunction(),
    retryOn: retryConfig.ZOBI_CLIENT_RETRY_STATUS_CODES || [502, 503, 504],
  };

  return {
    protocol: ['http:', 'https:'].includes(window?.location?.protocol)
      ? (window?.location?.protocol as 'http:' | 'https:')
      : undefined,
    host: window.location?.host || '',
    csrfToken: csrfToken || cookieCSRFToken,
    fetchRetryOptions,
  };
}

export default function setupClient(customConfig: Partial<ClientConfig> = {}) {
  ZobiClient.configure({
    ...getDefaultConfiguration(),
    ...customConfig,
  })
    .init()
    .catch(error => {
      logging.warn('Error initializing ZobiClient', error);
    });
}
