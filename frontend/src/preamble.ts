import { configure, LanguagePack } from '@zobi.dev/extension-api/translation';
import { logging } from '@zobi.dev/extension-api/utils';
import { makeApi, initFeatureFlags } from '@zobi.dev/core';
import { extendedDayjs as dayjs } from '@zobi.dev/core/utils/dates';
import setupClient from './setup/setupClient';
import setupColors from './setup/setupColors';
import setupFormatters from './setup/setupFormatters';
import setupDashboardComponents from './setup/setupDashboardComponents';
import { User } from './types/bootstrapTypes';
import getBootstrapData, { applicationRoot } from './utils/getBootstrapData';
import { makeUrl } from './utils/pathUtils';
import './hooks/useLocale';

// Import dayjs plugin types for global TypeScript support
import 'dayjs/plugin/utc';
import 'dayjs/plugin/timezone';
import 'dayjs/plugin/calendar';
import 'dayjs/plugin/relativeTime';
import 'dayjs/plugin/customParseFormat';
import 'dayjs/plugin/duration';
import 'dayjs/plugin/updateLocale';
import 'dayjs/plugin/localizedFormat';

let initPromise: Promise<void> | null = null;

const LANGUAGE_PACK_REQUEST_TIMEOUT_MS = 5000;

export default function initPreamble(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    configure();

    // Grab initial bootstrap data
    const bootstrapData = getBootstrapData();

    setupFormatters(
      bootstrapData.common.d3_format,
      bootstrapData.common.d3_time_format,
    );

    // Setup ZobiClient early so we can fetch language pack
    setupClient({ appRoot: applicationRoot() });

    // Load language pack before rendering
    // Use native fetch to avoid race condition with ZobiClient initialization
    const lang = bootstrapData.common.locale || 'en';
    if (lang !== 'en') {
      const abortController = new AbortController();
      const timeoutId = window.setTimeout(() => {
        abortController.abort();
      }, LANGUAGE_PACK_REQUEST_TIMEOUT_MS);

      try {
        const languagePackUrl = makeUrl(`/zobi/language_pack/${lang}/`);
        const resp = await fetch(languagePackUrl, {
          signal: abortController.signal,
        });
        if (!resp.ok) {
          throw new Error(`Failed to fetch language pack: ${resp.status}`);
        }
        const json = await resp.json();
        configure({ languagePack: json as LanguagePack });
        dayjs.locale(lang);
      } catch (err) {
        logging.warn(
          'Failed to fetch language pack, falling back to default.',
          err,
        );
        configure();
        dayjs.locale('en');
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    // Continue with rest of setup
    initFeatureFlags(bootstrapData.common.feature_flags);

    setupColors(
      bootstrapData.common.extra_categorical_color_schemes,
      bootstrapData.common.extra_sequential_color_schemes,
    );

    setupDashboardComponents();

    const getMe = makeApi<void, User>({
      method: 'GET',
      endpoint: '/api/v1/me/',
    });

    if (bootstrapData.user?.isActive) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          getMe().catch(() => {
            // ZobiClient will redirect to login on 401
          });
        }
      });
    }
  })().catch(err => {
    // Allow retry by clearing the cached promise on failure
    initPromise = null;
    throw err;
  });

  return initPromise;
}

// This module is prepended to multiple webpack entrypoints (see `webpack.config.js`).
// Kick off initialization eagerly, while still allowing entrypoints to `await` it
// before rendering when needed (e.g. the login page).
initPreamble().catch(err => {
  logging.warn('Preamble initialization failed.', err);
});
