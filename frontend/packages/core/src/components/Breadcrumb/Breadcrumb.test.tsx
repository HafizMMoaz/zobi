import { render, screen } from '@zobi.dev/core/spec';
import '@testing-library/jest-dom';
import { Breadcrumb } from '.';

describe('Breadcrumb Component', () => {
  test('renders breadcrumb items correctly', () => {
    render(
      <Breadcrumb>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>Library</Breadcrumb.Item>
        <Breadcrumb.Item>Data</Breadcrumb.Item>
      </Breadcrumb>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();

    const separators = screen.getAllByText('/');
    expect(separators.length).toBe(2);
  });
});
