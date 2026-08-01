
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { FilterBarOrientation } from 'src/dashboard/types';
import FilterDivider from './FilterDivider';

const SAMPLE_TITLE = 'Sample title';
const SAMPLE_DESCRIPTION =
  'Sample description that is even longer, it goes on and on and on and on and on and on and on and on and on and on.';

test('vertical mode, title', () => {
  render(<FilterDivider title={SAMPLE_TITLE} description="" />);
  const title = screen.getByRole('heading', { name: SAMPLE_TITLE });
  expect(title).toBeVisible();
  expect(title).toHaveTextContent(SAMPLE_TITLE);
  const description = screen.queryByTestId('divider-description');
  expect(description).not.toBeInTheDocument();
  const descriptionIcon = screen.queryByTestId('divider-description-icon');
  expect(descriptionIcon).not.toBeInTheDocument();
});

test('vertical mode, title and description', () => {
  render(
    <FilterDivider title={SAMPLE_TITLE} description={SAMPLE_DESCRIPTION} />,
  );

  const title = screen.getByRole('heading', { name: SAMPLE_TITLE });
  expect(title).toBeVisible();
  expect(title).toHaveTextContent(SAMPLE_TITLE);
  const description = screen.getByTestId('divider-description');
  expect(description).toBeVisible();
  expect(description).toHaveTextContent(SAMPLE_DESCRIPTION);
  const descriptionIcon = screen.queryByTestId('divider-description-icon');
  expect(descriptionIcon).not.toBeInTheDocument();
});

test('horizontal mode, title', () => {
  render(
    <FilterDivider
      orientation={FilterBarOrientation.Horizontal}
      title={SAMPLE_TITLE}
      description=""
      overflow
    />,
  );

  const title = screen.getByRole('heading', { name: SAMPLE_TITLE });
  expect(title).toBeVisible();
  expect(title).toHaveTextContent(SAMPLE_TITLE);
  const description = screen.queryByTestId('divider-description');
  expect(description).not.toBeInTheDocument();
  const descriptionIcon = screen.queryByTestId('divider-description-icon');
  expect(descriptionIcon).not.toBeInTheDocument();
});

test('horizontal mode, title and description', async () => {
  render(
    <FilterDivider
      orientation={FilterBarOrientation.Horizontal}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
    />,
  );

  const title = screen.getByRole('heading', { name: SAMPLE_TITLE });
  expect(title).toBeVisible();
  expect(title).toHaveTextContent(SAMPLE_TITLE);
  const description = screen.queryByTestId('divider-description');
  expect(description).not.toBeInTheDocument();
  const descriptionIcon = screen.getByTestId('divider-description-icon');
  expect(descriptionIcon).toBeVisible();
  userEvent.hover(descriptionIcon);
  const tooltip = await screen.findByRole('tooltip');

  expect(tooltip).toBeInTheDocument();
  expect(tooltip).toHaveTextContent(SAMPLE_DESCRIPTION);
});

test('horizontal overflow mode, title', () => {
  render(
    <FilterDivider
      orientation={FilterBarOrientation.Horizontal}
      overflow
      title={SAMPLE_TITLE}
      description=""
    />,
  );

  const title = screen.getByRole('heading', { name: SAMPLE_TITLE });
  expect(title).toBeVisible();
  expect(title).toHaveTextContent(SAMPLE_TITLE);
  const description = screen.queryByTestId('divider-description');
  expect(description).not.toBeInTheDocument();
  const descriptionIcon = screen.queryByTestId('divider-description-icon');
  expect(descriptionIcon).not.toBeInTheDocument();
});

test('horizontal overflow mode, title and description', () => {
  render(
    <FilterDivider
      orientation={FilterBarOrientation.Horizontal}
      overflow
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
    />,
  );

  const title = screen.getByRole('heading', { name: SAMPLE_TITLE });
  expect(title).toBeVisible();
  expect(title).toHaveTextContent(SAMPLE_TITLE);
  const description = screen.queryByTestId('divider-description');
  expect(description).toBeVisible();
  expect(description).toHaveTextContent(SAMPLE_DESCRIPTION);
  const descriptionIcon = screen.queryByTestId('divider-description-icon');
  expect(descriptionIcon).not.toBeInTheDocument();
});
