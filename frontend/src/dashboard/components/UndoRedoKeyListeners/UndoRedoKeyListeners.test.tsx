import { render, fireEvent } from 'spec/helpers/testing-library';
import UndoRedoKeyListeners from '.';

const defaultProps = {
  onUndo: jest.fn(),
  onRedo: jest.fn(),
};

test('renders nothing', () => {
  const { container } = render(<UndoRedoKeyListeners {...defaultProps} />);
  expect(container.children).toHaveLength(0);
});

test('triggers onUndo', () => {
  const onUndo = jest.fn();
  render(<UndoRedoKeyListeners {...defaultProps} onUndo={onUndo} />);
  fireEvent.keyDown(document.body, { key: 'z', keyCode: 90, ctrlKey: true });
  expect(onUndo).toHaveBeenCalledTimes(1);
});

test('triggers onRedo', () => {
  const onRedo = jest.fn();
  render(<UndoRedoKeyListeners {...defaultProps} onRedo={onRedo} />);
  fireEvent.keyDown(document.body, { key: 'y', keyCode: 89, ctrlKey: true });
  expect(onRedo).toHaveBeenCalledTimes(1);
});

test('does not trigger when it is another key', () => {
  const onUndo = jest.fn();
  const onRedo = jest.fn();
  render(<UndoRedoKeyListeners onUndo={onUndo} onRedo={onRedo} />);
  fireEvent.keyDown(document.body, { key: 'x', keyCode: 88, ctrlKey: true });
  expect(onUndo).not.toHaveBeenCalled();
  expect(onRedo).not.toHaveBeenCalled();
});

test('removes the event listener when unmounts', () => {
  document.removeEventListener = jest.fn();
  const { unmount } = render(<UndoRedoKeyListeners {...defaultProps} />);
  unmount();
  expect(document.removeEventListener).toHaveBeenCalledWith(
    'keydown',
    expect.anything(),
  );
});
