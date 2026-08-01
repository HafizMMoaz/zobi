import TooltipParagraph from '.';

export default {
  title: 'Components/DynamicTooltip',
  component: TooltipParagraph,
};

type IProps = {
  title: string;
  width: number;
};

export const InteractiveTooltip = (args: IProps) => (
  <div style={{ width: `${args.width}px`, margin: '50px 100px' }}>
    <TooltipParagraph>{args.title}</TooltipParagraph>
  </div>
);

InteractiveTooltip.args = {
  title: 'This is too long and should truncate.',
  width: 200,
};
