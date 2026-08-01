import { Jed as BaseJed, JedOptions, DomainData, Translations } from './jed';

export * from './jed';
export { default as __hack_reexport_jed } from './jed';

/**
 * Zobi supported languages.
 */
export type Locale =
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'it'
  | 'ja'
  | 'ko'
  | 'pt'
  | 'pt_BR'
  | 'ru'
  | 'zh'
  | 'zh_TW'; // supported locales in Zobi

/**
 * Language pack provided to `jed`.
 */
export type LanguagePack = JedOptions & {
  // eslint-disable-next-line camelcase
  locale_data: {
    zobi: DomainData & {
      '': {
        domain: 'zobi';
        lang: Locale;
        // eslint-disable-next-line camelcase
        plural_forms: string;
      };
    };
  };
};

export interface Jed extends BaseJed {
  options: LanguagePack;
}

/**
 * Config options for Translator class.
 */
export interface TranslatorConfig {
  languagePack?: LanguagePack;
}

/**
 * Key-value mapping of translation key and the translations.
 */
export type LocaleData = Partial<Record<Locale, Translations>>;

export default {};
