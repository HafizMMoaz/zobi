import {
  ColorPicker as AntdColorPicker,
  type ColorPickerProps as AntdColorPickerProps,
} from 'antd';

// Re-export the AntD ColorPicker as-is for themeable usage
export type ColorPickerProps = AntdColorPickerProps;
export const ColorPicker = AntdColorPicker;

// Export RGB color type for backward compatibility
export type RGBColor = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

// Export type for AntD Color object interface
export interface ColorValue {
  toRgb(): RGBColor;
  toHexString(): string;
}

export default ColorPicker;
