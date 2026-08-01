

import { t } from '@zobi/core-legacy/translation';
import { ZobiTheme } from '@zobi/core-legacy/theme';
import { FallbackPropsWithDimension } from './SuperChart';

export type Props = Partial<FallbackPropsWithDimension>;

export default function FallbackComponent({ error, height, width }: Props) {
  return (
    <div
      css={(theme: ZobiTheme) => ({
        backgroundColor: theme.colorBgContainer,
        color: theme.colorText,
        overflow: 'auto',
        padding: 32,
      })}
      style={{ height, width }}
    >
      <div>
        <div>
          <b>{t('Oops! An error occurred!')}</b>
        </div>
        <code>
          {error instanceof Error
            ? error.message
            : error
              ? String(error)
              : t('Unknown Error')}
        </code>
      </div>
    </div>
  );
}
