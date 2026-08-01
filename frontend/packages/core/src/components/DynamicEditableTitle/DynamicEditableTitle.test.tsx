import { render, screen, userEvent } from '@zobi.dev/core/spec';
import { DynamicEditableTitle } from '.';

const createProps = (overrides: Record<string, any> = {}) => ({
  title: 'Chart title',
  placeholder: 'Add the name of the chart',
  canEdit: true,
  onSave: jest.fn(),
  label: 'Chart title',
  ...overrides,
});

describe('Chart editable title', () => {
  test('renders chart title', () => {
    const props = createProps();
    render(<DynamicEditableTitle {...props} />);
    expect(screen.getByText('Chart title')).toBeVisible();
  });

  test('renders placeholder', () => {
    const props = createProps({
      title: '',
    });
    render(<DynamicEditableTitle {...props} />);
    expect(screen.getByText('Add the name of the chart')).toBeVisible();
  });

  test('click, edit and save title', async () => {
    const props = createProps();
    render(<DynamicEditableTitle {...props} />);
    const textboxElement = screen.getByRole('textbox');
    await userEvent.click(textboxElement);
    await userEvent.type(textboxElement, ' edited');
    expect(screen.getByText('Chart title edited')).toBeVisible();
    await userEvent.type(textboxElement, '{enter}');
    expect(props.onSave).toHaveBeenCalled();
  });

  test('renders in non-editable mode', async () => {
    const props = createProps({ canEdit: false });
    render(<DynamicEditableTitle {...props} />);
    const titleElement = screen.getByLabelText('Chart title');
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeDisabled();
    expect(titleElement).toBeVisible();
    await userEvent.click(titleElement);
    await userEvent.type(titleElement, ' edited{enter}');
    expect(props.onSave).not.toHaveBeenCalled();
  });
});
