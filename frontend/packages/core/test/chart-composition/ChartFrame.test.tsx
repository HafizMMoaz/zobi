import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChartFrame } from '@zobi.dev/core';

type Props = {
  contentWidth?: number;
  contentHeight?: number;
  height: number;
  renderContent: ({
    height,
    width,
  }: {
    height: number;
    width: number;
  }) => React.ReactNode;
  width: number;
};

const renderChartFrame = (props: Props) => render(<ChartFrame {...props} />);

test('renders content that requires smaller space than frame', () => {
  const { getByText } = renderChartFrame({
    width: 400,
    height: 400,
    contentWidth: 300,
    contentHeight: 300,
    renderContent: ({ width, height }) => (
      <div>
        {width}/{height}
      </div>
    ),
  });
  expect(getByText('400/400')).toBeInTheDocument();
});

test('renders content without specifying content size', () => {
  const { getByText } = renderChartFrame({
    width: 400,
    height: 400,
    renderContent: ({ width, height }) => (
      <div>
        {width}/{height}
      </div>
    ),
  });
  expect(getByText('400/400')).toBeInTheDocument();
});

test('renders content that requires equivalent size to frame', () => {
  const { getByText } = renderChartFrame({
    width: 400,
    height: 400,
    contentWidth: 400,
    contentHeight: 400,
    renderContent: ({ width, height }) => (
      <div>
        {width}/{height}
      </div>
    ),
  });
  expect(getByText('400/400')).toBeInTheDocument();
});

test('renders content that requires space larger than frame', () => {
  const { getByText, container } = renderChartFrame({
    width: 400,
    height: 400,
    contentWidth: 500,
    contentHeight: 500,
    renderContent: ({ width, height }) => (
      <div className="chart">
        {width}/{height}
      </div>
    ),
  });
  expect(getByText('500/500')).toBeInTheDocument();
  const containerDiv = container.firstChild as HTMLElement;
  expect(containerDiv).toHaveStyle({ overflowX: 'auto', overflowY: 'auto' });
});

test('renders content when width is larger than frame', () => {
  const { getByText, container } = renderChartFrame({
    width: 400,
    height: 400,
    contentWidth: 500,
    renderContent: ({ width, height }) => (
      <div className="chart">
        {width}/{height}
      </div>
    ),
  });
  expect(getByText('500/400')).toBeInTheDocument();
  const containerDiv = container.firstChild as HTMLElement;
  expect(containerDiv).toHaveStyle({ overflowX: 'auto', overflowY: 'hidden' });
});

test('renders content when height is larger than frame', () => {
  const { getByText, container } = renderChartFrame({
    width: 400,
    height: 400,
    contentHeight: 600,
    renderContent: ({ width, height }) => (
      <div className="chart">
        {width}/{height}
      </div>
    ),
  });
  expect(getByText('400/600')).toBeInTheDocument();
  const containerDiv = container.firstChild as HTMLElement;
  expect(containerDiv).toHaveStyle({ overflowX: 'hidden', overflowY: 'auto' });
});
