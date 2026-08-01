import { fireEvent, render } from '@zobi.dev/core/spec';

import { Label } from '.';
import { LabelGallery, options } from './Label.stories';

// test the basic component
test('renders the base component (no onClick)', () => {
  const { container } = render(<Label />);
  expect(container).toBeInTheDocument();
});

test('works with an onClick handler', () => {
  const mockAction = jest.fn();
  const { getByText } = render(<Label onClick={mockAction}>test</Label>);
  fireEvent.click(getByText('test'));
  expect(mockAction).toHaveBeenCalled();
});

test('renders with monospace prop', () => {
  const { getByText } = render(<Label monospace>monospace text</Label>);
  expect(getByText('monospace text')).toBeInTheDocument();
});

// test stories from the storybook!
test('renders all the storybook gallery variants', () => {
  const { container } = render(<LabelGallery />);
  const nonInteractiveLabelCount = 4;
  const renderedLabelCount = options.length * 2 + nonInteractiveLabelCount;
  expect(container.querySelectorAll('.ant-tag')).toHaveLength(
    renderedLabelCount,
  );
});
