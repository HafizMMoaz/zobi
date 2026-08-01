import { extendedDayjs as dayjs } from '@zobi.dev/core/utils/dates';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ExplorePageState } from 'src/explore/types';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import 'dayjs/locale/it';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/ja';
import 'dayjs/locale/de';
import 'dayjs/locale/pt';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/ru';
import 'dayjs/locale/ko';
import 'dayjs/locale/sk';
import 'dayjs/locale/sl';
import 'dayjs/locale/nl';

/* eslint-disable no-restricted-imports */
import { Locale } from 'antd/es/locale';

export const LOCALE_MAPPING = {
  en: () => import('antd/locale/en_US'),
  fr: () => import('antd/locale/fr_FR'),
  es: () => import('antd/locale/es_ES'),
  it: () => import('antd/locale/it_IT'),
  zh: () => import('antd/locale/zh_CN'),
  ja: () => import('antd/locale/ja_JP'),
  de: () => import('antd/locale/de_DE'),
  pt: () => import('antd/locale/pt_PT'),
  pt_BR: () => import('antd/locale/pt_BR'),
  ru: () => import('antd/locale/ru_RU'),
  ko: () => import('antd/locale/ko_KR'),
  sk: () => import('antd/locale/sk_SK'),
  sl: () => import('antd/locale/sl_SI'),
  nl: () => import('antd/locale/nl_NL'),
};
/* eslint-enable no-restricted-imports */

export const useLocale = (): Locale | undefined | null => {
  const [datePickerLocale, setDatePickerLocale] = useState<
    Locale | undefined | null
  >(null);

  // Retrieve the locale from Redux store
  const localFromFlaskBabel = useSelector(
    (state: ExplorePageState) => state?.common?.locale,
  );

  useEffect(() => {
    if (datePickerLocale === null) {
      if (
        localFromFlaskBabel &&
        LOCALE_MAPPING[localFromFlaskBabel as keyof typeof LOCALE_MAPPING]
      ) {
        LOCALE_MAPPING[localFromFlaskBabel as keyof typeof LOCALE_MAPPING]()
          .then((locale: { default: Locale }) => {
            setDatePickerLocale(locale.default);
            dayjs.locale(localFromFlaskBabel);
          })
          .catch(() => setDatePickerLocale(undefined));
      } else {
        setDatePickerLocale(undefined);
      }
    }
  }, [datePickerLocale, localFromFlaskBabel]);

  return datePickerLocale;
};
