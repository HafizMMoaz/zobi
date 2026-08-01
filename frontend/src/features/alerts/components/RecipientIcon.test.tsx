import { render, screen } from 'spec/helpers/testing-library';
import RecipientIcon from './RecipientIcon';
import { NotificationMethodOption } from '../types';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('RecipientIcon', () => {
  test('should render the email icon when type is Email', () => {
    const { container } = render(
      <RecipientIcon type={NotificationMethodOption.Email} />,
    );
    const emailIcon = container.querySelector('[data-icon="mail"]');
    expect(emailIcon).toBeInTheDocument();
  });

  test('should render the Slack icon when type is Slack', () => {
    render(<RecipientIcon type={NotificationMethodOption.Slack} />);
    const regexPattern = new RegExp(NotificationMethodOption.Slack, 'i');
    const slackIcon = screen.getByLabelText(regexPattern);
    expect(slackIcon).toBeInTheDocument();
  });

  test('should render the Slack icon when type is SlackV2', () => {
    render(<RecipientIcon type={NotificationMethodOption.SlackV2} />);
    const regexPattern = new RegExp(NotificationMethodOption.Slack, 'i');
    const slackIcon = screen.getByLabelText(regexPattern);
    expect(slackIcon).toBeInTheDocument();
  });

  test('should not render any icon when type is not recognized', () => {
    render(<RecipientIcon type="unknown" />);
    const icons = screen.queryByLabelText(/.*/);
    expect(icons).not.toBeInTheDocument();
  });

  test('All recipient types should have consistent accessibility attributes', () => {
    const types = [
      NotificationMethodOption.Email,
      NotificationMethodOption.Slack,
      NotificationMethodOption.SlackV2,
    ];

    types.forEach(type => {
      const { container } = render(<RecipientIcon type={type} />);
      const iconElement = container.querySelector('[role="img"]');

      // Every icon should exist and have these attributes for accessibility and testing
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveAttribute('aria-label');
      expect(iconElement).toHaveAttribute('data-test');
      expect(iconElement).toHaveAttribute('role', 'img');
    });
  });
});
