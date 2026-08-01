import AnchorLink from '.';

export default {
  title: 'Components/AnchorLink',
  component: AnchorLink,
};

export const InteractiveAnchorLink = (args: any) => (
  <AnchorLink id="link" {...args} />
);

const PLACEMENTS = ['right', 'left', 'top', 'bottom'];

InteractiveAnchorLink.args = {
  showShortLinkButton: true,
  placement: PLACEMENTS[0],
};

InteractiveAnchorLink.argTypes = {
  type: {
    placement: { type: 'select', options: PLACEMENTS },
  },
};
