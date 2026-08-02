import { render, fireEvent, screen } from '@zobi.dev/core/spec';
import { NoAnimationDropdown } from '.';

const props = {
  overlay: <div>Test Overlay</div>,
};
describe('NoAnimationDropdown', () => {
  test('requires children', () => {
    expect(() => {
      // @ts-expect-error need to test the error case
      render(<NoAnimationDropdown {...props} />);
    }).toThrow();
  });

  test('renders its children', () => {
    render(
      <NoAnimationDropdown {...props}>
        <button type="button">Test Button</button>
      </NoAnimationDropdown>,
    );
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  test('calls onBlur when it loses focus', () => {
    const onBlur = jest.fn();
    render(
      <NoAnimationDropdown {...props} onBlur={onBlur}>
        <button type="button">Test Button</button>
      </NoAnimationDropdown>,
    );
    fireEvent.blur(screen.getByText('Test Button'));
    expect(onBlur).toHaveBeenCalled();
  });

  test('calls onKeyDown when a key is pressed', () => {
    const onKeyDown = jest.fn();
    render(
      <NoAnimationDropdown {...props} onKeyDown={onKeyDown}>
        <button type="button">Test Button</button>
      </NoAnimationDropdown>,
    );
    fireEvent.keyDown(screen.getByText('Test Button'));
    expect(onKeyDown).toHaveBeenCalled();
  });
});
