import type { Layout } from 'src/dashboard/types';
import { DropResult } from 'src/dashboard/components/dnd/dragDroppableConfig';
import getComponentWidthFromDrop from './getComponentWidthFromDrop';

export default function doesChildOverflowParent(
  dropResult: DropResult,
  layout: Layout,
): boolean {
  const childWidth = getComponentWidthFromDrop({ dropResult, layout });
  return typeof childWidth === 'number' && childWidth < 0;
}
