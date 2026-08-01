import { useState, FC } from 'react';
import {
  ParagraphProps,
  Typography,
  Tooltip,
} from '@zobi.dev/core/components';

const TooltipParagraph: FC<ParagraphProps> = ({
  children,
  ellipsis,
  ...props
}) => {
  const [truncated, setTruncated] = useState(false);

  return (
    <Tooltip title={truncated ? children : undefined}>
      <Typography.Paragraph
        {...props}
        ellipsis={{ ...(ellipsis as any), onEllipsis: setTruncated }}
      >
        {/* NOTE: Fragment is necessary to avoid showing the title */}
        <>{children}</>
      </Typography.Paragraph>
    </Tooltip>
  );
};

export default TooltipParagraph;
