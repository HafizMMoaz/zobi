declare module 'react-lines-ellipsis' {
  interface ReactLinesEllipsisProps {
    basedOn?: 'letters' | 'words';
    className?: string;
    component?: string;
    ellipsis?: string;
    isClamped?: () => boolean;
    maxLine?: number | string;
    onReflow?: ({ clamped, text }: { clamped: boolean; text: string }) => any;
    style?: React.CSSProperties;
    text?: string;
    trimRight?: boolean;
    winWidth?: number;
  }

  // eslint-disable-next-line react/prefer-stateless-function
  class LinesEllipsis extends React.Component<ReactLinesEllipsisProps> {
    static defaultProps?: ReactLinesEllipsisProps;
  }

  export default LinesEllipsis;
}

declare module 'react-lines-ellipsis/lib/responsiveHOC' {
  export default function responsiveHOC(): <P extends object>(
    WrappedComponent: React.ComponentType<P>,
  ) => React.ComponentClass<P>;
}
