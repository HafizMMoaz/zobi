
import { TreeProps } from '@zobi.dev/core/components/Tree';
import { DropInfoType, FlatLayerDataNode } from './types';

/**
 * Util for drag and drop related operations.
 */

/**
 * Handle drop of flat antd tree.
 *
 * Functionality is roughly based on antd tree examples:
 * https://ant.design/components/tree/
 *
 * @param info The argument of the onDrop callback.
 * @param treeData The list of DataNodes on which the drop event occurred.
 * @returns A copy of the list with the new sorting.
 */
export const handleDrop = (
  info: DropInfoType<TreeProps['onDrop']>,
  treeData: FlatLayerDataNode[],
) => {
  if (info === undefined) {
    return [...treeData];
  }

  const dropKey = info.node.key;
  const dragKey = info.dragNode.key;
  const dropPos = info.node.pos.split('-');
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

  const data = [...treeData];

  const dragObjIndex = data.findIndex(d => d.key === dragKey);
  const dragObj = data[dragObjIndex];
  data.splice(dragObjIndex, 1);

  const dropObjIndex = data.findIndex(d => d.key === dropKey);
  if (dropPosition === -1) {
    data.splice(dropObjIndex, 0, dragObj!);
  } else {
    data.splice(dropObjIndex + 1, 0, dragObj!);
  }

  return data;
};
