import { render, screen } from 'spec/helpers/testing-library';
import CrossLinks, { CrossLinksProps } from './CrossLinks';

const mockedProps = {
  crossLinks: [
    {
      id: 1,
      title: 'Test dashboard',
    },
    {
      id: 2,
      title: 'Test dashboard 2',
    },
    {
      id: 3,
      title: 'Test dashboard 3',
    },
    {
      id: 4,
      title: 'Test dashboard 4',
    },
  ],
};

function setup(overrideProps: CrossLinksProps | {} = {}) {
  return render(<CrossLinks {...mockedProps} {...overrideProps} />, {
    useRouter: true,
  });
}

test('should render', () => {
  const { container } = setup();
  expect(container).toBeInTheDocument();
});

test('should not render links', () => {
  setup({
    crossLinks: [],
  });
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

test('should render the link with just one item', () => {
  setup({
    crossLinks: [
      {
        id: 1,
        title: 'Test dashboard',
      },
    ],
  });
  expect(screen.getByText('Test dashboard')).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', `/zobi/dashboard/1`);
});

test('should render a custom prefix link', () => {
  setup({
    crossLinks: [
      {
        id: 1,
        title: 'Test dashboard',
      },
    ],
    linkPrefix: '/custom/dashboard/',
  });
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    `/custom/dashboard/1`,
  );
});

test('should render multiple links', () => {
  setup();
  expect(screen.getAllByRole('link')).toHaveLength(4);
});
