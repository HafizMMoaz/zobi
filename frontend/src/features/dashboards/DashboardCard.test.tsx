
import { MemoryRouter } from 'react-router-dom';
import {
  JsonResponse,
  ZobiClient,
  isFeatureEnabled,
} from '@zobi-ui/core';

import { render, screen, waitFor } from 'spec/helpers/testing-library';

import DashboardCard from './DashboardCard';

const mockDashboard = {
  id: 1,
  dashboard_title: 'Sample Dashboard',
  certified_by: 'John Doe',
  certification_details: 'Certified on 2022-01-01',
  published: true,
  url: '/dashboard/1',
  thumbnail_url: '/thumbnails/1.png',
  changed_on_delta_humanized: '2 days ago',
  owners: [
    { id: 1, name: 'Alice', first_name: 'Alice', last_name: 'Doe' },
    { id: 2, name: 'Bob', first_name: 'Bob', last_name: 'Smith' },
  ],
  changed_by_name: 'John Doe',
  changed_by: 'john.doe@example.com',
};

const mockHasPerm = jest.fn().mockReturnValue(true);
const mockOpenDashboardEditModal = jest.fn();
const mockSaveFavoriteStatus = jest.fn();
const mockHandleBulkDashboardExport = jest.fn();
const mockOnDelete = jest.fn();

jest.mock('@zobi-ui/core', () => ({
  ...jest.requireActual('@zobi-ui/core'),
  isFeatureEnabled: jest.fn(),
}));

const mockedIsFeatureEnabled = isFeatureEnabled as jest.Mock;

beforeAll(() => {
  mockedIsFeatureEnabled.mockReturnValue(true);
});

afterAll(() => {
  mockedIsFeatureEnabled.mockClear();
});

beforeEach(() => {
  render(
    <MemoryRouter>
      <DashboardCard
        dashboard={mockDashboard}
        hasPerm={mockHasPerm}
        bulkSelectEnabled={false}
        loading={false}
        openDashboardEditModal={mockOpenDashboardEditModal}
        saveFavoriteStatus={mockSaveFavoriteStatus}
        favoriteStatus={false}
        handleBulkDashboardExport={mockHandleBulkDashboardExport}
        onDelete={mockOnDelete}
      />
    </MemoryRouter>,
  );
});

test('Renders the dashboard title', () => {
  const titleElement = screen.getByText('Sample Dashboard');
  expect(titleElement).toBeInTheDocument();
});

test('Renders the certification details', () => {
  const certificationDetailsElement = screen.getByLabelText(/certified/i);
  expect(certificationDetailsElement).toBeInTheDocument();
});

test('Renders the published status', () => {
  const publishedElement = screen.getByText(/published/i);
  expect(publishedElement).toBeInTheDocument();
});

test('Renders the modified date', () => {
  const modifiedDateElement = screen.getByText('Modified 2 days ago');
  expect(modifiedDateElement).toBeInTheDocument();
});

test('should fetch thumbnail when dashboard has no thumbnail URL and feature flag is enabled', async () => {
  const mockGet = jest.spyOn(ZobiClient, 'get').mockResolvedValue({
    json: { result: { thumbnail_url: '/new-thumbnail.png' } },
  } as unknown as JsonResponse);

  const { rerender } = render(
    <DashboardCard
      dashboard={{
        id: 1,
        thumbnail_url: '',
        changed_by_name: '',
        changed_by: '',
        dashboard_title: '',
        published: false,
        url: '',
        owners: [],
      }}
      hasPerm={() => true}
      bulkSelectEnabled={false}
      loading={false}
      saveFavoriteStatus={() => {}}
      favoriteStatus={false}
      handleBulkDashboardExport={() => {}}
      onDelete={() => {}}
    />,
  );
  await waitFor(() => {
    expect(mockGet).toHaveBeenCalledWith({
      endpoint: '/api/v1/dashboard/1',
    });
  });
  rerender(
    <DashboardCard
      dashboard={{
        id: 1,
        thumbnail_url: '/new-thumbnail.png',
        changed_by_name: '',
        changed_by: '',
        dashboard_title: '',
        published: false,
        url: '',
        owners: [],
      }}
      hasPerm={() => true}
      bulkSelectEnabled={false}
      loading={false}
      saveFavoriteStatus={() => {}}
      favoriteStatus={false}
      handleBulkDashboardExport={() => {}}
      onDelete={() => {}}
    />,
  );
  mockGet.mockRestore();
});
