import { render, screen, userEvent } from '@zobi.dev/core/spec';
import { Collapse } from '.';
import type { CollapseProps } from './types';

function renderCollapse(props?: CollapseProps) {
  return render(
    <Collapse
      {...props}
      items={[
        {
          key: '1',
          label: 'Header 1',
          children: 'Content 1',
        },
        {
          key: '2',
          label: 'Header 2',
          children: 'Content 2',
        },
      ]}
    />,
  );
}

test('renders collapsed with default props', () => {
  renderCollapse();

  const headers = screen.getAllByRole('button');

  expect(headers[0]).toHaveTextContent('Header 1');
  expect(headers[1]).toHaveTextContent('Header 2');
  expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
});

test('renders with one item expanded by default', () => {
  renderCollapse({ defaultActiveKey: ['1'] });

  const headers = screen.getAllByRole('button');

  expect(headers[0]).toHaveTextContent('Header 1');
  expect(headers[1]).toHaveTextContent('Header 2');
  expect(screen.getByText('Content 1')).toBeInTheDocument();
  expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
});

test('expands on click', async () => {
  renderCollapse();

  expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

  await userEvent.click(screen.getAllByRole('button')[0]);

  expect(screen.getByText('Content 1')).toBeInTheDocument();
  expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
});

test('collapses on click', async () => {
  renderCollapse({ defaultActiveKey: ['1'] });

  expect(screen.getByText('Content 1')).toBeInTheDocument();
  expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

  await userEvent.click(screen.getAllByRole('button')[0]);

  expect(screen.getByText('Content 1').parentNode).toHaveClass(
    'ant-collapse-content-hidden',
  );
  expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
});
