import { AsyncEsmComponent } from '.';
import type { PlaceholderProps } from './types';

export default {
  title: 'Components/AsyncEsmComponent',
};

const Placeholder = () => <span>Loading...</span>;

const AsyncComponent = ({ bold }: { bold: boolean }) => (
  <span style={{ fontWeight: bold ? 700 : 400 }}>AsyncComponent</span>
);

const Component = AsyncEsmComponent(
  new Promise(resolve => setTimeout(() => resolve(AsyncComponent), 3000)),
  Placeholder,
);

export const InteractiveEsmComponent = (args: PlaceholderProps) => (
  <Component {...args} showLoadingForImport />
);

InteractiveEsmComponent.args = {
  bold: true,
};
