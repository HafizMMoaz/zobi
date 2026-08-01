import { render, screen } from 'spec/helpers/testing-library';
import { ListViewFilterOperator } from '../types';
import UIFilters from './index';

const mockUpdateFilterValue = jest.fn();

beforeEach(() => {
  mockUpdateFilterValue.mockClear();
});

test('search filter uses id as input name when inputName is not provided', () => {
  const filters = [
    {
      Header: 'Name',
      key: 'name',
      id: 'name',
      input: 'search' as const,
      operator: ListViewFilterOperator.Contains,
    },
  ];

  render(
    <UIFilters
      filters={filters}
      internalFilters={[]}
      updateFilterValue={mockUpdateFilterValue}
    />,
  );

  const input = screen.getByTestId('filters-search') as HTMLInputElement;
  expect(input.name).toBe('name');
});

test('search filter uses inputName when provided instead of id', () => {
  const filters = [
    {
      Header: 'Name',
      key: 'name',
      id: 'name',
      input: 'search' as const,
      operator: ListViewFilterOperator.Contains,
      inputName: 'custom_search_name',
    },
  ];

  render(
    <UIFilters
      filters={filters}
      internalFilters={[]}
      updateFilterValue={mockUpdateFilterValue}
    />,
  );

  const input = screen.getByTestId('filters-search') as HTMLInputElement;
  expect(input.name).toBe('custom_search_name');
});

test('search filter passes autoComplete prop correctly', () => {
  const filters = [
    {
      Header: 'Name',
      key: 'name',
      id: 'name',
      input: 'search' as const,
      operator: ListViewFilterOperator.Contains,
      autoComplete: 'new-password',
    },
  ];

  render(
    <UIFilters
      filters={filters}
      internalFilters={[]}
      updateFilterValue={mockUpdateFilterValue}
    />,
  );

  const input = screen.getByTestId('filters-search') as HTMLInputElement;
  expect(input.autocomplete).toBe('new-password');
});

test('renders multiple search filters with different inputName values', () => {
  const filters = [
    {
      Header: 'Name',
      key: 'name',
      id: 'name',
      input: 'search' as const,
      operator: ListViewFilterOperator.Contains,
      inputName: 'filter_name_search',
    },
    {
      Header: 'Description',
      key: 'description',
      id: 'description',
      input: 'search' as const,
      operator: ListViewFilterOperator.Contains,
      // No inputName - should use id
    },
  ];

  render(
    <UIFilters
      filters={filters}
      internalFilters={[]}
      updateFilterValue={mockUpdateFilterValue}
    />,
  );

  const inputs = screen.getAllByTestId('filters-search') as HTMLInputElement[];
  expect(inputs).toHaveLength(2);
  expect(inputs[0].name).toBe('filter_name_search');
  expect(inputs[1].name).toBe('description');
});
