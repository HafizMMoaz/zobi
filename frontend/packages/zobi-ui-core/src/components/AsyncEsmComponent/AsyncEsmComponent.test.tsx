import { render, screen } from '@zobi-ui/core/spec';
import { AsyncEsmComponent } from '.';

const Placeholder = () => <span>Loading...</span>;

const AsyncComponent = ({ bold }: { bold: boolean }) => (
  <span style={{ fontWeight: bold ? 700 : 400 }}>AsyncComponent</span>
);

const ComponentPromise = new Promise(resolve =>
  setTimeout(() => resolve(AsyncComponent), 500),
);

test('renders without placeholder', async () => {
  const Component = AsyncEsmComponent(ComponentPromise);
  render(<Component showLoadingForImport={false} />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(await screen.findByText('AsyncComponent')).toBeInTheDocument();
});

test('renders with default placeholder', async () => {
  const Component = AsyncEsmComponent(ComponentPromise);
  render(<Component height={30} showLoadingForImport />);
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(await screen.findByText('AsyncComponent')).toBeInTheDocument();
});

test('renders with custom placeholder', async () => {
  const Component = AsyncEsmComponent(ComponentPromise, Placeholder);
  render(<Component showLoadingForImport />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(await screen.findByText('AsyncComponent')).toBeInTheDocument();
});

test('renders with custom props', async () => {
  const Component = AsyncEsmComponent(ComponentPromise, Placeholder);
  render(<Component showLoadingForImport bold />);
  const asyncComponent = await screen.findByText('AsyncComponent');
  expect(asyncComponent).toBeInTheDocument();
  expect(asyncComponent).toHaveStyle({ fontWeight: 700 });
});
