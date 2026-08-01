import { isValidElement } from 'react';
import { render } from 'spec/helpers/testing-library';
import ColumnElement from 'src/SqlLab/components/ColumnElement';
import { table } from 'src/SqlLab/fixtures';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ColumnElement', () => {
  test('is valid with props', () => {
    expect(isValidElement(<ColumnElement column={table.columns[0]} />)).toBe(
      true,
    );
  });
  test('renders a proper primary key', () => {
    const { container } = render(<ColumnElement column={table.columns[0]} />);
    expect(container.querySelector('i.fa-key')).toBeInTheDocument();
    expect(
      container.querySelector('[data-test="col-name"]')?.firstChild,
    ).toHaveTextContent('id');
  });
  test('renders a multi-key column', () => {
    const { container } = render(<ColumnElement column={table.columns[1]} />);
    expect(container.querySelector('i.fa-link')).toBeInTheDocument();
    expect(container.querySelector('i.fa-bookmark')).toBeInTheDocument();
    expect(
      container.querySelector('[data-test="col-name"]')?.firstChild,
    ).toHaveTextContent('first_name');
  });
  test('renders a column with no keys', () => {
    const { container } = render(<ColumnElement column={table.columns[2]} />);
    expect(container.querySelector('i')).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-test="col-name"]')?.firstChild,
    ).toHaveTextContent('last_name');
  });
});
