import { render } from '@zobi-ui/core/spec';
import Sparkline from './Sparkline';

const mockEntries = [
  { time: '2023-01-01', sales: 100 },
  { time: '2023-01-02', sales: 200 },
  { time: '2023-01-03', sales: 300 },
  { time: '2023-01-04', sales: 400 },
];

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('Sparkline', () => {
  test('should render basic sparkline without time ratio', () => {
    const column = {
      key: 'test-sparkline',
      colType: 'spark',
      width: '200',
      height: '40',
    };

    const { container } = render(
      <Sparkline valueField="sales" column={column} entries={mockEntries} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  test('should handle time ratio sparkline', () => {
    const column = {
      key: 'test-sparkline',
      colType: 'spark',
      timeRatio: 2,
      width: '200',
      height: '40',
    };

    const { container } = render(
      <Sparkline valueField="sales" column={column} entries={mockEntries} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  test('should handle string time ratio', () => {
    const column = {
      key: 'test-sparkline',
      colType: 'spark',
      timeRatio: '1',
      width: '200',
      height: '40',
    };

    const { container } = render(
      <Sparkline valueField="sales" column={column} entries={mockEntries} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  test('should use default dimensions when not specified', () => {
    const column = {
      key: 'test-sparkline',
      colType: 'spark',
    };

    const { container } = render(
      <Sparkline valueField="sales" column={column} entries={mockEntries} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  test('should handle yAxis bounds configuration', () => {
    const column = {
      key: 'test-sparkline',
      colType: 'spark',
      yAxisBounds: [0, 500] as [number, number],
      showYAxis: true,
    };

    const { container } = render(
      <Sparkline valueField="sales" column={column} entries={mockEntries} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  test('should handle invalid yAxis bounds', () => {
    const column = {
      key: 'test-sparkline',
      colType: 'spark',
      yAxisBounds: [] as null[],
    };

    const { container } = render(
      <Sparkline valueField="sales" column={column} entries={mockEntries} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
