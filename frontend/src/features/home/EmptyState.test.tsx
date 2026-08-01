import { TableTab } from 'src/views/CRUD/types';
import { render, screen } from 'spec/helpers/testing-library';
import EmptyState, { EmptyStateProps } from './EmptyState';
import { WelcomeTable } from './types';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('EmptyState', () => {
  const variants: EmptyStateProps[] = [
    {
      tab: TableTab.Favorite,
      tableName: WelcomeTable.Dashboards,
    },
    {
      tab: TableTab.Mine,
      tableName: WelcomeTable.Dashboards,
    },
    {
      tab: TableTab.Favorite,
      tableName: WelcomeTable.Charts,
    },
    {
      tab: TableTab.Mine,
      tableName: WelcomeTable.Charts,
    },
    {
      tab: TableTab.Favorite,
      tableName: WelcomeTable.SavedQueries,
    },
    {
      tab: TableTab.Mine,
      tableName: WelcomeTable.SavedQueries,
    },
  ];
  const recents: EmptyStateProps[] = [
    {
      tab: TableTab.Viewed,
      tableName: WelcomeTable.Recents,
    },
    {
      tab: TableTab.Edited,
      tableName: WelcomeTable.Recents,
    },
    {
      tab: TableTab.Created,
      tableName: WelcomeTable.Recents,
    },
  ];

  variants.forEach(variant => {
    test(`renders an ${variant.tab} ${variant.tableName} empty state`, () => {
      const { container } = render(<EmptyState {...variant} />);

      // Select the first description node
      expect(
        container.querySelector('.ant-empty-description'),
      ).toHaveTextContent('Nothing here yet');
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });
  });

  recents.forEach(recent => {
    test(`renders a ${recent.tab} ${recent.tableName} empty state`, () => {
      const { container } = render(<EmptyState {...recent} />);

      // Select the first description node
      // Check the correct text is displayed
      expect(
        container.querySelector('.ant-empty-description'),
      ).toHaveTextContent('Nothing here yet');

      // Validate the image
      expect(
        container.querySelector('.ant-empty-image')?.children,
      ).toHaveLength(1);
    });
  });
});
