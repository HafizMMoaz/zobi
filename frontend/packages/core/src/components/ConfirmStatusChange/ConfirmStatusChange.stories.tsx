import { Button } from '@zobi.dev/core/components';
import { ConfirmStatusChange } from '.';
import type { ConfirmStatusChangeProps, Callback } from './types';

export default {
  title: 'Components/ConfirmStatusChange',
};

export const InteractiveConfirmStatusChange = (
  args: ConfirmStatusChangeProps,
) => <ConfirmStatusChange {...args} />;

InteractiveConfirmStatusChange.args = {
  title: 'Delete confirmation',
  description: 'Are you sure you want to delete?',
  children: (showConfirm: Callback) => (
    <Button onClick={() => showConfirm()}>DELETE</Button>
  ),
};

InteractiveConfirmStatusChange.argTypes = {
  onConfirm: { action: 'onConfirm' },
};
