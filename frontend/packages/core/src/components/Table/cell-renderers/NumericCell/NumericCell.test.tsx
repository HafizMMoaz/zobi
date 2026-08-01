import { render, screen } from '@zobi.dev/core/spec';
import NumericCell, { CurrencyCode, LocaleCode, Style } from './index';

test('renders with French locale and Euro currency format', () => {
  render(
    <NumericCell
      value={5678943}
      locale={LocaleCode.fr}
      options={{
        style: Style.Currency,
        currency: CurrencyCode.EUR,
      }}
    />,
  );
  expect(screen.getByText('5 678 943,00 €')).toBeInTheDocument();
});

test('renders with English US locale and USD currency format', () => {
  render(
    <NumericCell
      value={5678943}
      locale={LocaleCode.en_US}
      options={{
        style: Style.Currency,
        currency: CurrencyCode.USD,
      }}
    />,
  );
  expect(screen.getByText('$5,678,943.00')).toBeInTheDocument();
});
