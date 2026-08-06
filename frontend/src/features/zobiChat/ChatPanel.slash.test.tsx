import { render, screen, waitFor } from 'spec/helpers/testing-library';
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
