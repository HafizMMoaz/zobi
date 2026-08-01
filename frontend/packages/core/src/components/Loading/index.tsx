
import cls from 'classnames';
import { t } from '@zobi.dev/extension-api/translation';
import { styled, useTheme } from '@zobi.dev/extension-api/theme';
import { Loading as LoaderSvg } from '../assets';
import type { LoadingProps, SizeOption } from './types';

const SIZE_MAP: Record<SizeOption, string> = {
  s: '40px',
  m: '70px',
  l: '100px',
};

const LoaderWrapper = styled.div<{
  $spinnerWidth: string;
  $spinnerHeight: string;
  $opacity: number;
}>`
  z-index: 99;
  width: ${({ $spinnerWidth }) => $spinnerWidth};
  height: ${({ $spinnerHeight }) => $spinnerHeight};
  opacity: ${({ $opacity }) => $opacity};
  position: relative;
  margin: 0;
  padding: 0;

  & > svg,
  & > img {
    width: 100%;
    height: 100%;
  }

  &.inline-centered {
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &.floating {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`;
export function Loading({
  position = 'floating',
  image,
  className,
  size = 'm',
  muted = false,
}: LoadingProps) {
  const theme = useTheme();

  // Determine size from size prop
  const spinnerSize = SIZE_MAP[size];

  // Opacity - muted reduces to 0.25, otherwise full opacity
  const opacity = muted ? 0.25 : 1.0;

  // Render spinner content
  const renderSpinner = () => {
    // Precedence: explicit image prop > brandSpinnerSvg > brandSpinnerUrl > default SVG
    if (image) {
      return <img src={image} alt={`${t('Loading')}...`} />;
    }
    if (theme.brandSpinnerSvg) {
      const svgDataUri = `data:image/svg+xml;base64,${btoa(theme.brandSpinnerSvg)}`;
      return <img src={svgDataUri} alt={`${t('Loading')}...`} />;
    }
    if (theme.brandSpinnerUrl) {
      return <img src={theme.brandSpinnerUrl} alt={`${t('Loading')}...`} />;
    }
    // Default: use the imported SVG component
    return <LoaderSvg />;
  };

  return (
    <LoaderWrapper
      $spinnerWidth={spinnerSize}
      $spinnerHeight="auto"
      $opacity={opacity}
      className={cls('loading', position, className)}
      role="status"
      aria-live="polite"
      aria-label={t('Loading')}
      data-test="loading-indicator"
    >
      {renderSpinner()}
    </LoaderWrapper>
  );
}

export type { LoadingProps };
