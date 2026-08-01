import { fireEvent, render } from 'spec/helpers/testing-library';
import KeyboardShortcutButton, { KEY_MAP, KeyboardShortcut } from '.';

test('renders shortcut description', () => {
  const { getByText, getByRole } = render(
    <KeyboardShortcutButton>Show shortcuts</KeyboardShortcutButton>,
  );
  fireEvent.click(getByRole('button'));
  expect(getByText('Keyboard shortcuts')).toBeInTheDocument();
  Object.keys(KEY_MAP)
    .filter(key => Boolean(KEY_MAP[key as KeyboardShortcut]))
    .forEach(key => {
      expect(getByText(key)).toBeInTheDocument();
    });
});
