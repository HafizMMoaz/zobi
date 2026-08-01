import { render, screen, fireEvent } from '@zobi-ui/core/spec';
import '@testing-library/jest-dom';
import { Radio } from '.';

describe('Radio Component', () => {
  test('renders radio button and allows selection', () => {
    render(
      <Radio.Group>
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
      </Radio.Group>,
    );

    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');

    expect(option1).not.toBeChecked();
    expect(option2).not.toBeChecked();

    fireEvent.click(option1);
    expect(option1).toBeChecked();
    expect(option2).not.toBeChecked();

    fireEvent.click(option2);
    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
  });
});
