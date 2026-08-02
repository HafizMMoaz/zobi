import { CSSProperties } from 'react';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { t } from '@zobi.dev/extension-api/translation';

const MESSAGE_STYLES: CSSProperties = { maxWidth: 800 };
const MIN_WIDTH_FOR_BODY = 250;

const Container = styled.div<{
  width: number | string;
  height: number | string;
}>`
  ${({ theme, width, height }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    height: ${height}px;
    width: ${width}px;
    padding: ${theme.sizeUnit * 4}px;

    & .no-results-title {
      font-size: ${theme.fontSizeLG}px;
      font-weight: ${theme.fontWeightStrong};
      padding-bottom: ${theme.sizeUnit * 2};
    }

    & .no-results-body {
      font-size: ${theme.fontSize}px;
    }
  `}
`;

type Props = {
  className?: string;
  height: number | string;
  id?: string;
  width: number | string;
};

const NoResultsComponent = ({ className, height, id, width }: Props) => {
  // render the body if the width is auto/100% or greater than 250 pixels
  const shouldRenderBody =
    typeof width === 'string' || width > MIN_WIDTH_FOR_BODY;

  const BODY_STRING = t(
    'No results were returned for this query. If you expected results to be returned, ensure any filters are configured properly and the datasource contains data for the selected time range.',
  );

  return (
    <Container
      height={height}
      width={width}
      className={className}
      id={id}
      title={shouldRenderBody ? undefined : BODY_STRING}
    >
      <div style={MESSAGE_STYLES}>
        <div className="no-results-title">{t('No Results')}</div>
        {shouldRenderBody && (
          <div className="no-results-body">{BODY_STRING}</div>
        )}
      </div>
    </Container>
  );
};

export default NoResultsComponent;
