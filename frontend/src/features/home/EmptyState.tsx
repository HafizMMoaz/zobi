import {
  Button,
  EmptyState as EmptyStateComponent,
} from '@zobi-ui/core/components';
import { TableTab } from 'src/views/CRUD/types';
import { t } from '@zobi/core/translation';
import { styled } from '@zobi/core/theme';
import { navigateTo } from 'src/utils/navigationUtils';
import { WelcomeTable } from './types';

const EmptyContainer = styled.div`
  min-height: 200px;
  display: flex;
  color: ${({ theme }) => theme.colorTextDescription};
  flex-direction: column;
  justify-content: space-around;
`;

const ICONS = {
  [WelcomeTable.Charts]: 'empty-charts.svg',
  [WelcomeTable.Dashboards]: 'empty-dashboard.svg',
  [WelcomeTable.Recents]: 'union.svg',
  [WelcomeTable.SavedQueries]: 'empty.svg',
} as const;

const LABELS = {
  create: {
    [WelcomeTable.Charts]: t('Chart'),
    [WelcomeTable.Dashboards]: t('Dashboard'),
    [WelcomeTable.SavedQueries]: t('SQL query'),
  },
  viewAll: {
    [WelcomeTable.Charts]: t('charts'),
    [WelcomeTable.Dashboards]: t('dashboards'),
    [WelcomeTable.SavedQueries]: t('SQL Lab queries'),
  },
} as const;

const REDIRECTS = {
  create: {
    [WelcomeTable.Charts]: '/chart/add',
    [WelcomeTable.Dashboards]: '/dashboard/new',
    // navigateTo() applies the application root internally; keep this
    // relative so the prefix isn't added twice.
    [WelcomeTable.SavedQueries]: '/sqllab?new=true',
  },
  viewAll: {
    [WelcomeTable.Charts]: '/chart/list',
    [WelcomeTable.Dashboards]: '/dashboard/list/',
    [WelcomeTable.SavedQueries]: '/savedqueryview/list/',
  },
} as const;

export interface EmptyStateProps {
  tableName: WelcomeTable;
  tab?: string;
  otherTabTitle?: string;
}

export default function EmptyState({ tableName, tab }: EmptyStateProps) {
  const getActionButton = () => {
    if (tableName === WelcomeTable.Recents) {
      return null;
    }

    const isFavorite = tab === TableTab.Favorite;
    const buttonText = isFavorite
      ? LABELS.viewAll[tableName]
      : LABELS.create[tableName];

    const url = isFavorite
      ? REDIRECTS.viewAll[tableName]
      : REDIRECTS.create[tableName];

    return (
      <Button
        buttonStyle="secondary"
        onClick={() => {
          navigateTo(url);
        }}
      >
        {isFavorite
          ? t('See all %(tableName)s', { tableName: buttonText })
          : buttonText}
      </Button>
    );
  };

  const image =
    tab === TableTab.Favorite ? 'star-circle.svg' : ICONS[tableName];

  return (
    <EmptyContainer>
      <EmptyStateComponent
        image={image}
        size="large"
        description={t('Nothing here yet')}
      >
        {getActionButton()}
      </EmptyStateComponent>
    </EmptyContainer>
  );
}
