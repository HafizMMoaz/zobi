import { render, screen } from '@testing-library/react';
import { createWrapper } from 'spec/helpers/testing-library';
import DashboardLinksExternal from '.';

const mockDashboards = [
  {
    id: 1,
    dashboard_title: 'Sales Dashboard',
    url: '/dashboard/1/',
  },
  {
    id: 2,
    dashboard_title: 'Analytics Dashboard',
    url: '/dashboard/2/',
  },
  {
    id: 3,
    dashboard_title: 'Very Long Dashboard Name That Should Be Truncated',
    url: '/dashboard/3/',
  },
];

const setupTest = (dashboards = mockDashboards) =>
  render(<DashboardLinksExternal dashboards={dashboards} />, {
    wrapper: createWrapper({
      useRedux: true,
      useRouter: true,
    }),
  });

test('renders empty state when no dashboards provided', () => {
  setupTest([]);
  expect(screen.getByText('—')).toBeInTheDocument();
});

test('renders empty state when dashboards is null/undefined', () => {
  render(<DashboardLinksExternal dashboards={null as any} />, {
    wrapper: createWrapper({
      useRedux: true,
      useRouter: true,
    }),
  });
  expect(screen.getByText('—')).toBeInTheDocument();
});

test('renders single dashboard link correctly', () => {
  setupTest([mockDashboards[0]]);

  const link = screen.getByText('Sales Dashboard');
  expect(link).toBeInTheDocument();
  expect(link.closest('a')).toHaveAttribute('href', '/zobi/dashboard/1/');
  expect(link.closest('a')).toHaveAttribute('target', '_blank');
});

test('renders multiple dashboard links with commas', () => {
  setupTest();

  expect(screen.getByText('Sales Dashboard')).toBeInTheDocument();
  expect(screen.getByText(', Analytics Dashboard')).toBeInTheDocument();
  expect(
    screen.getByText(', Very Long Dashboard Name That Should Be Truncated'),
  ).toBeInTheDocument();
});

test('all links open in new tabs', () => {
  setupTest();

  const links = screen.getAllByRole('link');
  links.forEach(link => {
    expect(link).toHaveAttribute('target', '_blank');
  });
});

test('links have correct href attributes', () => {
  setupTest();

  const salesLink = screen.getByText('Sales Dashboard').closest('a');
  const analyticsLink = screen.getByText(', Analytics Dashboard').closest('a');
  const longNameLink = screen
    .getByText(', Very Long Dashboard Name That Should Be Truncated')
    .closest('a');

  expect(salesLink).toHaveAttribute('href', '/zobi/dashboard/1/');
  expect(analyticsLink).toHaveAttribute('href', '/zobi/dashboard/2/');
  expect(longNameLink).toHaveAttribute('href', '/zobi/dashboard/3/');
});

test('applies correct styling classes', () => {
  setupTest();

  const truncatedSpan = document.querySelector('.truncated');
  expect(truncatedSpan).toBeInTheDocument();
  expect(truncatedSpan).toContainElement(screen.getAllByRole('link')[0]);
});

test('handles dashboard with empty title', () => {
  const dashboardWithEmptyTitle = [
    {
      id: 1,
      dashboard_title: '',
      url: '/dashboard/1/',
    },
  ];

  setupTest(dashboardWithEmptyTitle);

  const link = screen.getByRole('link');
  expect(link).toHaveTextContent('');
  expect(link).toHaveAttribute('href', '/zobi/dashboard/1/');
});
