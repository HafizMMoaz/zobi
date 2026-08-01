export function BottomRightResizeHandle(): JSX.Element {
  return <div className="resize-handle resize-handle--bottom-right" />;
}

export function RightResizeHandle(): JSX.Element {
  return <div className="resize-handle resize-handle--right" />;
}

export function BottomResizeHandle(): JSX.Element {
  return <div className="resize-handle resize-handle--bottom" />;
}

export default {
  right: RightResizeHandle,
  bottom: BottomResizeHandle,
  bottomRight: BottomRightResizeHandle,
};
