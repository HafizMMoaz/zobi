import type React from 'react';
import { render, screen, fireEvent } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import SlashPalette from './SlashPalette';
import { AgentToolSummary } from './types';

const TOOLS: AgentToolSummary[] = [
  {
    name: 'list_datasets',
    title: 'List datasets',
    risk: 'read',
    description: 'Lists datasets',
  },
  {
    name: 'run_query',
    title: 'Run query',
    risk: 'write',
    description: 'Runs SQL',
  },
];

const setup = (props: Partial<React.ComponentProps<typeof SlashPalette>>) =>
  render(
    <SlashPalette
      tools={TOOLS}
      query=""
      open
      onSelect={jest.fn()}
      onDismiss={jest.fn()}
      {...props}
    />,
  );

test('renders nothing when closed', () => {
  setup({ open: false });

  expect(screen.queryByText('List datasets')).not.toBeInTheDocument();
});

test('lists every tool when the query is empty', () => {
  setup({});

  expect(screen.getByText('List datasets')).toBeInTheDocument();
  expect(screen.getByText('Run query')).toBeInTheDocument();
});

test('filters on name and title', () => {
  setup({ query: 'quer' });

  expect(screen.queryByText('List datasets')).not.toBeInTheDocument();
  expect(screen.getByText('Run query')).toBeInTheDocument();
});

test('shows a risk badge for tools that are not read-only', () => {
  setup({});

  expect(screen.getByText('write')).toBeInTheDocument();
});

test('clicking a tool selects it', async () => {
  const onSelect = jest.fn();
  setup({ onSelect });

  await userEvent.click(screen.getByText('Run query'));

  expect(onSelect).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'run_query' }),
  );
});

test('Enter selects the highlighted tool', () => {
  const onSelect = jest.fn();
  setup({ onSelect });

  fireEvent.keyDown(document, { key: 'ArrowDown' });
  fireEvent.keyDown(document, { key: 'Enter' });

  expect(onSelect).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'run_query' }),
  );
});

test('Escape dismisses', () => {
  const onDismiss = jest.fn();
  setup({ onDismiss });

  fireEvent.keyDown(document, { key: 'Escape' });

  expect(onDismiss).toHaveBeenCalled();
});

test('a query matching nothing shows an empty state', () => {
  setup({ query: 'zzzz' });

  expect(screen.getByText('No matching tools')).toBeInTheDocument();
});
