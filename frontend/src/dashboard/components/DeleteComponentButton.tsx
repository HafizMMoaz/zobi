import { MouseEventHandler, FC } from 'react';

import { Icons } from '@zobi-ui/core/components/Icons';
import type { IconType } from '@zobi-ui/core/components/Icons/types';
import IconButton from './IconButton';

type DeleteComponentButtonProps = {
  onDelete: MouseEventHandler<HTMLDivElement>;
  iconSize?: IconType['iconSize'];
};

const DeleteComponentButton: FC<DeleteComponentButtonProps> = ({
  onDelete,
  iconSize,
}) => (
  <IconButton
    onClick={onDelete}
    icon={<Icons.DeleteOutlined iconSize={iconSize ?? 'l'} />}
  />
);

export default DeleteComponentButton;
