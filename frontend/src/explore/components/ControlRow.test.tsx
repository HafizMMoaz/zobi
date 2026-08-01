import { ReactElement } from 'react';
import { render, screen } from 'spec/helpers/testing-library';
import ControlSetRow from 'src/explore/components/ControlRow';
import StashFormDataContainer from './StashFormDataContainer';

const MockControl = (props: {
  children: ReactElement;
  type?: string;
  isVisible?: boolean;
}) => <div>{props.children}</div>;
test('renders a single row with one element', () => {
  render(<ControlSetRow controls={[<p>My Control 1</p>]} />);
  expect(screen.getAllByText('My Control 1').length).toBe(1);
});
test('renders a single row with two elements', () => {
  render(
    <ControlSetRow controls={[<p>My Control 1</p>, <p>My Control 2</p>]} />,
  );
  expect(screen.getAllByText(/My Control/)).toHaveLength(2);
  expect(screen.getAllByText(/My Control/)[0]).toBeVisible();
  expect(screen.getAllByText(/My Control/)[1]).toBeVisible();
});

test('renders a single row with one elements if is HiddenControl', () => {
  render(
    <ControlSetRow
      controls={[
        <p>My Control 1</p>,
        <MockControl type="HiddenControl">
          <p>My Control 2</p>
        </MockControl>,
      ]}
    />,
  );
  expect(screen.getAllByText(/My Control/)).toHaveLength(2);
  expect(screen.getAllByText(/My Control/)[0]).toBeVisible();
  expect(screen.getAllByText(/My Control/)[1]).not.toBeVisible();
});

test('renders a single row with one elements if is invisible', () => {
  render(
    <ControlSetRow
      controls={[
        <p>My Control 1</p>,
        <MockControl isVisible={false}>
          <p>My Control 2</p>
        </MockControl>,
      ]}
    />,
  );
  expect(screen.getAllByText(/My Control/)).toHaveLength(2);
  expect(screen.getAllByText(/My Control/)[0]).toBeVisible();
  expect(screen.getAllByText(/My Control/)[1]).not.toBeVisible();
});

test('renders a single row with one element wrapping with StashContainer if is invisible', () => {
  render(
    <ControlSetRow
      controls={[
        <p>My Control 1</p>,
        <StashFormDataContainer shouldStash fieldNames={['field1']}>
          <MockControl isVisible={false}>
            <p>My Control 2</p>
          </MockControl>
        </StashFormDataContainer>,
      ]}
    />,
    { useRedux: true },
  );
  expect(screen.getAllByText(/My Control/)).toHaveLength(2);
  expect(screen.getAllByText(/My Control/)[0]).toBeVisible();
  expect(screen.getAllByText(/My Control/)[1]).not.toBeVisible();
});
