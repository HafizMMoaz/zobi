import { StoryFn, Meta } from '@storybook/react';
import { CurrencyCode, NumericCell, LocaleCode, Style } from './index';

export default {
  title: 'Design System/Components/Table/Cell Renderers/NumericCell',
  component: NumericCell,
} as Meta<typeof NumericCell>;

export const Basic: StoryFn<typeof NumericCell> = args => (
  <NumericCell {...args} />
);

Basic.args = {
  value: 5678943,
};

export const FrenchLocale: StoryFn<typeof NumericCell> = args => (
  <NumericCell {...args} />
);

FrenchLocale.args = {
  value: 5678943,
  locale: LocaleCode.fr,
  options: {
    style: Style.Currency,
    currency: CurrencyCode.EUR,
  },
};
