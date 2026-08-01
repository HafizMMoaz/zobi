import { render, screen, userEvent } from 'spec/helpers/testing-library';
import FilterConfigurationLink from '.';

test('should render', () => {
  const { container } = render(
    <FilterConfigurationLink>Config link</FilterConfigurationLink>,
    {
      useRedux: true,
    },
  );
  expect(container).toBeInTheDocument();
});

test('should render the config link text', () => {
  render(<FilterConfigurationLink>Config link</FilterConfigurationLink>, {
    useRedux: true,
  });
  expect(screen.getByText('Config link')).toBeInTheDocument();
});

test('should render the modal on click', () => {
  const showModal = jest.fn();
  render(
    <FilterConfigurationLink onClick={showModal}>
      Config link
    </FilterConfigurationLink>,
    {
      useRedux: true,
    },
  );
  const configLink = screen.getByText('Config link');
  userEvent.click(configLink);
  expect(showModal).toHaveBeenCalled();
});
