import {
  render,
  screen,
  waitFor,
  fireEvent,
  selectOption,
} from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import ChatPanel from './ChatPanel';
import * as api from './api';

jest.mock('./api');

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  mockedApi.fetchModes.mockResolvedValue([
    { value: 'manual', label: 'Ask before changes', description: '' },
  ]);
  mockedApi.fetchChatModels.mockResolvedValue([]);
  mockedApi.fetchTools.mockResolvedValue([
    {
      name: 'list_datasets',
      title: 'List datasets',
      risk: 'read',
      description: 'Lists datasets',
    },
  ]);
  mockedApi.createConversation.mockResolvedValue({ id: 1, uuid: 'u' });
  mockedApi.streamMessage.mockReturnValue(() => {});
});

test('typing "/" opens the palette', async () => {
  render(<ChatPanel />);

  await userEvent.type(await screen.findByRole('textbox'), '/');

  expect(await screen.findByText('List datasets')).toBeInTheDocument();
});

test('a space closes the palette, since the tool name is complete', async () => {
  render(<ChatPanel />);

  await userEvent.type(await screen.findByRole('textbox'), '/list ');

  await waitFor(() =>
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
  );
});

test('choosing a tool pins it as a chip and clears the slash text', async () => {
  render(<ChatPanel />);
  const input = await screen.findByRole('textbox');

  await userEvent.type(input, '/list');
  await userEvent.click(await screen.findByText('List datasets'));

  expect(
    await screen.findByLabelText('Remove pinned tool'),
  ).toBeInTheDocument();
  expect(input).toHaveValue('');
});

test('sending includes the pinned tool and then clears it', async () => {
  render(<ChatPanel />);
  const input = await screen.findByRole('textbox');

  await userEvent.type(input, '/list');
  await userEvent.click(await screen.findByText('List datasets'));
  await userEvent.type(input, 'the sales ones');
  await userEvent.click(screen.getByLabelText('Send'));

  await waitFor(() =>
    expect(mockedApi.streamMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ force_tool: 'list_datasets' }),
      expect.anything(),
      expect.anything(),
    ),
  );
  await waitFor(() =>
    expect(
      screen.queryByLabelText('Remove pinned tool'),
    ).not.toBeInTheDocument(),
  );
});

test('the chip can be dismissed without sending', async () => {
  render(<ChatPanel />);
  const input = await screen.findByRole('textbox');

  await userEvent.type(input, '/list');
  await userEvent.click(await screen.findByText('List datasets'));
  await userEvent.click(screen.getByLabelText('Remove pinned tool'));

  expect(screen.queryByLabelText('Remove pinned tool')).not.toBeInTheDocument();
});

test('pressing Enter while the palette is open selects the tool instead of sending it as a message', async () => {
  // The mock is not reset between tests in this file, and an earlier test
  // already sent a message; clear its call history so a stray leftover call
  // cannot masquerade as this test's own bug.
  mockedApi.streamMessage.mockClear();
  render(<ChatPanel />);
  const input = await screen.findByRole('textbox');

  await userEvent.type(input, '/list');
  await screen.findByText('List datasets');

  // Fired on the input itself, not on document: the bug this guards against
  // is a race in the bubble order between the composer's own Enter handler
  // and SlashPalette's document-level listener, so the event has to travel
  // that same real path to prove the fix.
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(
    await screen.findByLabelText('Remove pinned tool'),
  ).toBeInTheDocument();
  expect(input).toHaveValue('');
  expect(mockedApi.streamMessage).not.toHaveBeenCalled();
});

test('changing the mode while the palette is open keeps the highlight in range', async () => {
  mockedApi.fetchModes.mockResolvedValue([
    { value: 'manual', label: 'Ask before changes', description: '' },
    { value: 'auto', label: 'Auto', description: '' },
  ]);
  mockedApi.fetchTools.mockImplementation(mode =>
    Promise.resolve(
      mode === 'auto'
        ? [
            {
              name: 'list_datasets',
              title: 'List datasets',
              risk: 'read' as const,
              description: '',
            },
            {
              name: 'run_query',
              title: 'Run query',
              risk: 'write' as const,
              description: '',
            },
          ]
        : [
            {
              name: 'list_datasets',
              title: 'List datasets',
              risk: 'read' as const,
              description: '',
            },
            {
              name: 'run_query',
              title: 'Run query',
              risk: 'write' as const,
              description: '',
            },
            {
              name: 'build_chart',
              title: 'Build chart',
              risk: 'write' as const,
              description: '',
            },
          ],
    ),
  );

  render(<ChatPanel />);
  const input = await screen.findByRole('textbox');

  await userEvent.type(input, '/');
  await screen.findByText('Build chart');

  // Move the highlight to the third (last) row of the manual-mode list.
  fireEvent.keyDown(document, { key: 'ArrowDown' });
  fireEvent.keyDown(document, { key: 'ArrowDown' });

  // Switching mode refetches tools; the auto-mode list only has two entries,
  // so the highlight at index 2 would point past the end unless it clamps.
  await selectOption('Auto');
  await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2));

  const options = screen.getAllByRole('option');
  expect(options[1]).toHaveAttribute('aria-selected', 'true');
});

test('the thread picker persists and the once picker does not', async () => {
  mockedApi.fetchChatModels.mockResolvedValue([
    { alias: 'fast', is_default: false },
    { alias: 'gpt-4o', is_default: true },
  ]);
  render(<ChatPanel />);

  await userEvent.click(await screen.findByRole('combobox', { name: 'Model' }));
  await userEvent.click(await screen.findByRole('option', { name: 'fast' }));

  await waitFor(() =>
    expect(mockedApi.updateConversation).toHaveBeenCalledWith(
      expect.anything(),
      { model_alias: 'fast' },
    ),
  );

  mockedApi.updateConversation.mockClear();

  // Querying by role rather than text: the Model dropdown just closed but
  // stays mounted (hidden) in the DOM, and a plain text query would match its
  // leftover "gpt-4o (default)" option as well as the freshly opened one.
  // getByRole excludes it because antd marks the closed popup hidden via CSS.
  await userEvent.click(
    screen.getByRole('combobox', { name: 'This message only' }),
  );
  await userEvent.click(
    await screen.findByRole('option', { name: 'gpt-4o (default)' }),
  );

  expect(mockedApi.updateConversation).not.toHaveBeenCalled();
});

test('the once override is sent and then reverts', async () => {
  mockedApi.fetchChatModels.mockResolvedValue([
    { alias: 'fast', is_default: false },
  ]);
  render(<ChatPanel />);

  await userEvent.click(
    await screen.findByRole('combobox', { name: 'This message only' }),
  );
  await userEvent.click(await screen.findByRole('option', { name: 'fast' }));
  await userEvent.type(await screen.findByRole('textbox'), 'hello');
  await userEvent.click(screen.getByLabelText('Send'));

  await waitFor(() =>
    expect(mockedApi.streamMessage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ model_alias: 'fast' }),
      expect.anything(),
      expect.anything(),
    ),
  );
  await waitFor(() =>
    expect(
      screen.getByRole('combobox', { name: 'This message only' }),
    ).toHaveValue(''),
  );
});
