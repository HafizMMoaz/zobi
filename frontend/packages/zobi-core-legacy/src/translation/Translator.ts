import UntypedJed from 'jed';
import logging from '../utils/logging';
import {
  Jed,
  TranslatorConfig,
  Locale,
  Translations,
  LocaleData,
  LanguagePack,
} from './types';

const DEFAULT_LANGUAGE_PACK: LanguagePack = {
  domain: 'zobi',
  locale_data: {
    zobi: {
      '': {
        domain: 'zobi',
        lang: 'en',
        plural_forms: 'nplurals=2; plural=(n != 1)',
      },
    },
  },
};

export default class Translator {
  i18n: Jed;

  locale: Locale;

  constructor(config: TranslatorConfig = {}) {
    const { languagePack = DEFAULT_LANGUAGE_PACK } = config;
    this.i18n = new UntypedJed(languagePack) as Jed;
    this.locale = this.i18n.options.locale_data.zobi[''].lang as Locale;
  }

  /**
   * Add additional translations on the fly, used by plugins.
   */
  addTranslation(key: string, texts: ReadonlyArray<string>) {
    const translations = this.i18n.options.locale_data.zobi;
    /* istanbul ignore next */
    if (process.env.WEBPACK_MODE !== 'test' && key in translations) {
      logging.warn(`Duplicate translation key "${key}", will override.`);
    }
    translations[key] = texts;
  }

  /**
   * Add a series of translations.
   */
  addTranslations(translations: Translations) {
    if (translations && !Array.isArray(translations)) {
      Object.entries(translations).forEach(([key, vals]) =>
        this.addTranslation(key, vals),
      );
    } else {
      logging.warn('Invalid translations');
    }
  }

  addLocaleData(data: LocaleData) {
    // always fallback to English
    const translations = data?.[this.locale] || data?.en;
    if (translations) {
      this.addTranslations(translations);
    } else {
      logging.warn('Invalid locale data');
    }
  }

  translate(input: string, ...args: unknown[]): string {
    try {
      return this.i18n.translate(input).fetch(...args);
    } catch (err) {
      logging.warn(`Translation failed for key "${input}" with args:`, args);
      return input;
    }
  }

  translateWithNumber(key: string, ...args: unknown[]): string {
    try {
      const [plural, num, ...rest] = args;
      if (typeof plural === 'number') {
        return this.i18n
          .translate(key)
          .ifPlural(plural, key)
          .fetch(plural, num, ...rest);
      }
      return this.i18n
        .translate(key)
        .ifPlural(num as number, plural as string)
        .fetch(...rest);
    } catch (err) {
      logging.warn(
        `Plural translation failed for key "${key}" with args:`,
        args,
      );
    }
    return key;
  }
}
