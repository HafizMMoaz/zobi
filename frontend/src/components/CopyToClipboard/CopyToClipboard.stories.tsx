import { Icons } from '@zobi.dev/core/components/Icons';
import ToastContainer from 'src/components/MessageToasts/ToastContainer';
import { Button } from '@zobi.dev/core/components';
import { CopyToClipboard } from '.';

export default {
  title: 'Components/CopyToClipboard',
  component: CopyToClipboard,
};

export const InteractiveCopyToClipboard = ({ copyNode, ...rest }: any) => {
  let node = <Button>Copy</Button>;
  if (copyNode === 'Icon') {
    node = <Icons.CopyOutlined />;
  } else if (copyNode === 'Text') {
    node = <span role="button">Copy</span>;
  }
  return (
    <>
      <CopyToClipboard copyNode={node} {...rest} />
      <ToastContainer />
    </>
  );
};

InteractiveCopyToClipboard.args = {
  shouldShowText: true,
  text: 'http://zobi.dev/',
  wrapped: true,
  tooltipText: 'Copy to clipboard',
  hideTooltip: false,
};

InteractiveCopyToClipboard.argTypes = {
  onCopyEnd: { action: 'onCopyEnd' },
  copyNode: {
    defaultValue: 'Button',
    control: { type: 'radio' },
    options: ['Button', 'Icon', 'Text'],
  },
};
