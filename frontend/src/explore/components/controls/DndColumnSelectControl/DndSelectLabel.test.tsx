import { useContext } from 'react';
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { DndItemType } from 'src/explore/components/DndItemType';
import DndSelectLabel, {
  DndSelectLabelProps,
} from 'src/explore/components/controls/DndColumnSelectControl/DndSelectLabel';
import ExploreContainer, { DropzoneContext } from '../../ExploreContainer';

const defaultProps: DndSelectLabelProps = {
  name: 'Column',
  accept: 'Column' as DndItemType,
  onDrop: jest.fn(),
  canDrop: () => false,
  valuesRenderer: () => <span />,
  ghostButtonText: 'Drop columns here or click',
  onClickGhostButton: jest.fn(),
};
const MockChildren = () => {
  const [zones] = useContext(DropzoneContext);
  return (
    <>
      {Object.keys(zones).map(key => (
        <div key={key} data-test={`mock-result-${key}`}>
          {String(
            zones[key]({
              value: { column_name: 'test' },
              type: DndItemType.Column,
            }),
          )}
        </div>
      ))}
    </>
  );
};

test('renders with default props', () => {
  render(<DndSelectLabel {...defaultProps} />, { useDnd: true });
  expect(screen.getByText('Drop columns here or click')).toBeInTheDocument();
});

test('renders ghost button when empty', () => {
  const ghostButtonText = 'Ghost button text';
  render(
    <DndSelectLabel {...defaultProps} ghostButtonText={ghostButtonText} />,
    { useDnd: true },
  );
  expect(screen.getByText(ghostButtonText)).toBeInTheDocument();
});

test('renders values', () => {
  const values = 'Values';
  const valuesRenderer = () => <span>{values}</span>;
  render(<DndSelectLabel {...defaultProps} valuesRenderer={valuesRenderer} />, {
    useDnd: true,
  });
  expect(screen.getByText(values)).toBeInTheDocument();
});

test('Handles ghost button click', () => {
  render(<DndSelectLabel {...defaultProps} />, { useDnd: true });
  userEvent.click(screen.getByText('Drop columns here or click'));
  expect(defaultProps.onClickGhostButton).toHaveBeenCalled();
});

test('updates dropValidator on changes', () => {
  const { getByTestId, rerender } = render(
    <ExploreContainer>
      <DndSelectLabel {...defaultProps} />
      <MockChildren />
    </ExploreContainer>,
    { useDnd: true },
  );
  expect(getByTestId(`mock-result-${defaultProps.name}`)).toHaveTextContent(
    'false',
  );
  rerender(
    <ExploreContainer>
      <DndSelectLabel {...defaultProps} canDrop={() => true} />
      <MockChildren />
    </ExploreContainer>,
  );
  expect(getByTestId(`mock-result-${defaultProps.name}`)).toHaveTextContent(
    'true',
  );
});
