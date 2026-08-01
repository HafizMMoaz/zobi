import { Icons } from '@zobi.dev/core/components/Icons';
import { Button } from '@zobi.dev/core/components';
import { Tag } from 'src/components';
import { FC } from 'react';
import { LayerTreeItemProps } from './types';

export const LayerTreeItem: FC<LayerTreeItemProps> = ({
  layerConf,
  onEditClick = () => {},
  onRemoveClick = () => {},
  className,
}) => {
  const onCloseTag = () => {
    onRemoveClick();
  };

  const onEditTag = () => {
    onEditClick();
  };

  return (
    <Tag className={className}>
      <Button
        className="layer-tree-item-close"
        icon={<Icons.CloseOutlined iconSize="m" />}
        onClick={onCloseTag}
        size="small"
      />
      <span
        className="layer-tree-item-type"
        onClick={onEditTag}
        role="button"
        tabIndex={0}
      >
        {layerConf.type}
      </span>
      <span
        className="layer-tree-item-title"
        onClick={onEditTag}
        role="button"
        tabIndex={0}
      >
        {layerConf.title}
      </span>
      <Button
        className="layer-tree-item-edit"
        icon={<Icons.RightOutlined />}
        onClick={onEditTag}
        size="small"
      />
    </Tag>
  );
};

export default LayerTreeItem;
