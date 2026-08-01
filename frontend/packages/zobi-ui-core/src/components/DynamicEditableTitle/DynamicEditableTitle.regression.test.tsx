import { fireEvent, render, screen, userEvent } from '@zobi-ui/core/spec';
import { useState } from 'react';
import { DynamicEditableTitle } from '.';

const Harness = ({ initialTitle = 'Original' }: { initialTitle?: string }) => {
  const [title, setTitle] = useState(initialTitle);
  return (
    <DynamicEditableTitle
      title={title}
      placeholder="placeholder"
      canEdit
      label="Title"
      onSave={setTitle}
    />
  );
};

test('rapid typing then backspacing keeps every keystroke', async () => {
  render(<Harness />);
  const input = screen.getByRole('textbox') as HTMLInputElement;
  userEvent.click(input);
  await userEvent.type(input, 'abc', { delay: 1 });
  expect(input.value).toBe('Originalabc');
  await userEvent.type(input, '{backspace}{backspace}{backspace}', {
    delay: 1,
  });
  expect(input.value).toBe('Original');
});

test('a change event that arrives before isEditing flips is not dropped', () => {
  // Reproduces the regression: the input is focused but `isEditing` is still
  // false because no click has been registered yet (e.g. focus arrived via
  // tab, autofocus, or programmatic focus). The pre-fix `handleChange`
  // bailed out with `!isEditing`, dropping the keystroke. Because the
  // input is controlled, antd's internal `useMergedState` then resyncs the
  // DOM value back to the (stale) `props.value`, so the user sees their
  // typed character disappear. This test fires a raw change event so it
  // doesn't go through userEvent's implicit click.
  const onSave = jest.fn();
  render(
    <DynamicEditableTitle
      title="Foo"
      placeholder="placeholder"
      canEdit
      label="Title"
      onSave={onSave}
    />,
  );
  const input = screen.getByRole('textbox') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'FooX' } });
  expect(input.value).toBe('FooX');
});

test('prop changes mid-edit do not clobber unsaved typing', async () => {
  const { rerender } = render(<Harness initialTitle="Foo" />);
  const input = screen.getByRole('textbox') as HTMLInputElement;
  userEvent.click(input);
  await userEvent.type(input, 'X', { delay: 1 });
  expect(input.value).toBe('FooX');
  rerender(<Harness initialTitle="Foo" />);
  expect(input.value).toBe('FooX');
});
