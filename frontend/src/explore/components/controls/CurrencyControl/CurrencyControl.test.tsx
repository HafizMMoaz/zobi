import { render, selectOption } from 'spec/helpers/testing-library';
import { CurrencyControl } from './CurrencyControl';

test('CurrencyControl renders position and symbol selects', () => {
  const { container } = render(
    <CurrencyControl onChange={jest.fn()} value={{}} />,
    {
      useRedux: true,
      initialState: {
        common: { currencies: ['USD', 'EUR'] },
        explore: { datasource: {} },
      },
    },
  );

  expect(
    container.querySelector('[data-test="currency-control-container"]'),
  ).toBeInTheDocument();
  expect(container.querySelectorAll('.ant-select')).toHaveLength(2);
});

test('CurrencyControl handles string currency value', async () => {
  const onChange = jest.fn();
  const { container } = render(
    <CurrencyControl
      onChange={onChange}
      value='{"symbol":"USD","symbolPosition":"prefix"}'
    />,
    {
      useRedux: true,
      initialState: {
        common: { currencies: ['USD', 'EUR'] },
        explore: { datasource: {} },
      },
    },
  );

  expect(
    container.querySelector('[data-test="currency-control-container"]'),
  ).toBeInTheDocument();

  await selectOption('Suffix', 'Currency prefix or suffix');
  expect(onChange).toHaveBeenLastCalledWith({
    symbol: 'USD',
    symbolPosition: 'suffix',
  });
});
