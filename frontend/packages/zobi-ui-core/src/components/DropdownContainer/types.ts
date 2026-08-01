import type { CSSProperties, ReactElement, RefObject, ReactNode } from 'react';

/**
 * Container item.
 */
export interface DropdownItem {
  /**
   * String that uniquely identifies the item.
   */
  id: string;
  /**
   * The element to be rendered.
   */
  element: ReactElement;
}

/**
 * Horizontal container that displays overflowed items in a dropdown.
 * It shows an indicator of how many items are currently overflowing.
 */
export interface DropdownContainerProps {
  /**
   * Array of items. The id property is used to uniquely identify
   * the elements when rendering or dealing with event handlers.
   */
  items: DropdownItem[];
  /**
   * Event handler called every time an element moves between
   * main container and dropdown.
   */
  onOverflowingStateChange?: (overflowingState: {
    notOverflowed: string[];
    overflowed: string[];
  }) => void;
  /**
   * Option to customize the content of the dropdown.
   */
  dropdownContent?: (overflowedItems: DropdownItem[]) => ReactElement;
  /**
   * Dropdown ref.
   */
  dropdownRef?: RefObject<HTMLDivElement>;
  /**
   * Dropdown additional style properties.
   */
  dropdownStyle?: CSSProperties;
  /**
   * Displayed count in the dropdown trigger.
   */
  dropdownTriggerCount?: number;
  /**
   * Icon of the dropdown trigger.
   */
  dropdownTriggerIcon?: ReactNode;
  /**
   * Text of the dropdown trigger.
   */
  dropdownTriggerText?: string;
  /**
   * Text of the dropdown trigger tooltip
   */
  dropdownTriggerTooltip?: ReactNode | null;
  /**
   * Main container additional style properties.
   */
  style?: CSSProperties;
  /**
   * Force render popover content before it's first opened
   */
  forceRender?: boolean;
}

export type DropdownRef = HTMLDivElement & { open: () => void };
