
// eslint-disable-next-line
import { ZobiTheme, css } from '@zobi/core-legacy/theme';
import { Typography } from '../Typography';
import { Icons } from '../Icons';
import { Card } from '../Card';
import { Tooltip } from '../Tooltip';
import { CardProps } from '../Card/types';

interface IconButtonProps extends CardProps {
  buttonText: string;
  icon: string;
  altText?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  buttonText,
  icon,
  altText,
  ...cardProps
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (cardProps.onClick) {
        (cardProps.onClick as React.EventHandler<React.SyntheticEvent>)(e);
      }
      if (e.key === ' ') {
        e.preventDefault();
      }
    }
    cardProps.onKeyDown?.(e);
  };

  const renderIcon = () => {
    const iconContent = (
      <div
        css={css`
          display: flex;
          align-content: center;
          align-items: center;
          height: 100px;
        `}
      >
        {icon ? (
          <img
            src={icon as string}
            alt={altText || buttonText}
            css={css`
              width: 100%;
              object-fit: contain;
              height: 48px;
            `}
          />
        ) : (
          <Icons.DatabaseOutlined iconSize="xxl" aria-label="default-icon" />
        )}
      </div>
    );

    return iconContent;
  };

  return (
    <Card
      hoverable
      role="button"
      tabIndex={0}
      aria-label={buttonText}
      onKeyDown={handleKeyDown}
      cover={renderIcon()}
      css={(theme: ZobiTheme) => ({
        padding: theme.sizeUnit * 3,
        textAlign: 'center',
        ...cardProps.style,
      })}
      {...cardProps}
    >
      <Tooltip title={buttonText}>
        <Typography.Text ellipsis>{buttonText}</Typography.Text>
      </Tooltip>
    </Card>
  );
};

export { IconButton };
export type { IconButtonProps };
