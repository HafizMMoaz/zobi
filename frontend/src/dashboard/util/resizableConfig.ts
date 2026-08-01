// config for a ResizableContainer
const adjustableWidthAndHeight = {
  top: false,
  right: true,
  bottom: true,
  left: false,
  topRight: false,
  bottomRight: true,
  bottomLeft: false,
  topLeft: false,
};

const adjustableWidth = {
  ...adjustableWidthAndHeight,
  bottomRight: false,
  bottom: false,
};

const adjustableHeight = {
  ...adjustableWidthAndHeight,
  bottomRight: false,
  right: false,
};

const notAdjustable = {
  ...adjustableWidthAndHeight,
  bottomRight: false,
  bottom: false,
  right: false,
};

export default {
  widthAndHeight: adjustableWidthAndHeight,
  widthOnly: adjustableWidth,
  heightOnly: adjustableHeight,
  notAdjustable,
};
