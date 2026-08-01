import { useDeferredValue, useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import ControlHeader, {
  ControlHeaderProps,
} from 'src/explore/components/ControlHeader';
import { styled } from '@zobi.dev/extension-api/theme';
import { ControlComponentProps } from '@zobi.dev/chart-controls';
import {
  safeParseEChartOptions,
  EChartOptionsParseError,
} from '@zobi.dev/echarts';
import { EditorHost } from 'src/core/editors';

const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.colorBorder};
  border-radius: ${({ theme }) => theme.borderRadius}px;
  overflow: hidden;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colorErrorText};
`;

export default function JSEditorControl({
  name,
  label,
  description,
  renderTrigger,
  hovered,
  tooltipOnClick,
  onChange,
  value,
}: ControlHeaderProps & ControlComponentProps<string>) {
  const deferredValue = useDeferredValue(value);
  const error = useMemo(() => {
    try {
      safeParseEChartOptions(deferredValue ?? '');
      return null;
    } catch (err) {
      if (err instanceof EChartOptionsParseError) {
        return err;
      }
      throw err;
    }
  }, [deferredValue]);
  const headerProps = {
    name,
    label: label ?? name,
    description,
    renderTrigger,
    validationErrors: error?.message ? [error.message] : undefined,
    hovered,
    tooltipOnClick,
  };

  return (
    <>
      <ControlHeader {...headerProps} />
      <Container>
        <AutoSizer disableHeight>
          {({ width }) => (
            <EditorHost
              id="echart-js-editor"
              value={value ?? ''}
              onChange={val => onChange?.(val)}
              language="javascript"
              tabSize={2}
              lineNumbers
              width={`${width}px`}
              height="250px"
            />
          )}
        </AutoSizer>
      </Container>
      {error && (
        <ErrorMessage>
          {error.validationErrors.length > 0 ? (
            error.validationErrors.map((err, idx) => <div key={idx}>{err}</div>)
          ) : (
            <div>{error.message}</div>
          )}
        </ErrorMessage>
      )}
    </>
  );
}
