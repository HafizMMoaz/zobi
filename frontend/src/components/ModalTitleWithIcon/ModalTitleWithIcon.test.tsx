import { render, screen } from 'spec/helpers/testing-library';
import { Icons } from '@zobi.dev/core/components';
import { ModalTitleWithIcon } from '.';

// ModalTitleWithIcon
test('ModalTitleWithIcon renders the title without icon if none is passed and isEditMode is undefined', () => {
  render(<ModalTitleWithIcon title="My Title" />);
  expect(screen.getByText('My Title')).toBeInTheDocument();

  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('ModalTitleWithIcon renders Edit icon if isEditMode is true', () => {
  render(<ModalTitleWithIcon title="Edit Mode" isEditMode />);
  expect(screen.getByText('Edit Mode')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /edit/i })).toBeInTheDocument();
});

test('ModalTitleWithIcon renders Plus icon if isEditMode is false', () => {
  render(<ModalTitleWithIcon title="Add Mode" isEditMode={false} />);
  expect(screen.getByText('Add Mode')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /plus/i })).toBeInTheDocument();
});

test('ModalTitleWithIcon renders custom icon when passed explicitly', () => {
  render(
    <ModalTitleWithIcon
      title="Custom Icon"
      icon={<Icons.DownOutlined data-test="custom-icon" />}
    />,
  );
  expect(screen.getByText('Custom Icon')).toBeInTheDocument();
  expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
});

test('ModalTitleWithIcon respects the level prop (e.g., renders h3 for level=3)', () => {
  const { container } = render(
    <ModalTitleWithIcon title="Header Level 3" level={3} />,
  );
  expect(container.querySelector('h3')).toHaveTextContent('Header Level 3');
});
