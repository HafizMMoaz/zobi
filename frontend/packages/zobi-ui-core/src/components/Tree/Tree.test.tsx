import { render, screen, fireEvent } from '@zobi-ui/core/spec';
import '@testing-library/jest-dom';
import Tree from './index';

const treeData = [
  {
    title: 'Parent 1',
    key: '0-0',
    children: [
      { title: 'Child 1', key: '0-0-0' },
      { title: 'Child 2', key: '0-0-1' },
    ],
  },
];

describe('Tree Component', () => {
  test('expands and collapses parent node', async () => {
    render(<Tree treeData={treeData} defaultExpandAll={false} />);

    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Child 2')).not.toBeInTheDocument();

    const toogleNode = screen.getByRole('img', { name: 'caret-down' });
    fireEvent.click(toogleNode);

    expect(await screen.findByText('Child 1')).toBeInTheDocument();
    expect(await screen.findByText('Child 2')).toBeInTheDocument();

    fireEvent.click(toogleNode);

    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Child 2')).not.toBeInTheDocument();
  });
});
