

import { render, screen } from '@zobi-ui/core/spec';
import '@testing-library/jest-dom';
import NoResultsComponent from '../../../src/chart/components/NoResultsComponent';

const renderNoResultsComponent = () =>
  render(<NoResultsComponent height="400" width="300" />);

test('renders the no results error', () => {
  renderNoResultsComponent();

  expect(screen.getByText(/No Results/)).toBeInTheDocument();
  expect(
    screen.getByText(
      'No results were returned for this query. If you expected results to be returned, ensure any filters are configured properly and the datasource contains data for the selected time range.',
    ),
  ).toBeInTheDocument();
});
