import { FC, ReactNode } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, useTheme, ZobiTheme } from '@zobi.dev/extension-api/theme';
import { FormLabel, InfoTooltip, Tooltip } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';

type ValidationError = string;

export type ControlHeaderProps = {
  name?: string;
  label?: ReactNode;
  description?: ReactNode;
  validationErrors?: ValidationError[];
  renderTrigger?: boolean;
  rightNode?: ReactNode;
  leftNode?: ReactNode;
  onClick?: () => void;
  hovered?: boolean;
  tooltipOnClick?: () => void;
  warning?: string;
  danger?: string;
  // Allow extra props from control spread patterns (e.g. {...this.props})
  [key: string]: unknown;
};

const iconStyles = css`
  &.anticon {
    font-size: unset;
    overflow: visible;
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
    padding-bottom: 0.1em;
    .anticon {
      line-height: unset;
      vertical-align: unset;
      overflow: visible;
    }
  }
`;

const ControlHeader: FC<ControlHeaderProps> = ({
  name,
  label,
  description,
  validationErrors = [],
  renderTrigger = false,
  rightNode,
  leftNode,
  onClick,
  hovered = false,
  tooltipOnClick = () => {},
  warning,
  danger,
}) => {
  const theme = useTheme();

  if (!label) {
    return null;
  }

  const renderOptionalIcons = () => {
    if (!hovered) {
      return null;
    }

    return (
      <span
        css={() => css`
          position: absolute;
          top: 50%;
          right: 0;
          padding-left: ${theme.sizeUnit}px;
          transform: translate(100%, -50%);
          white-space: nowrap;
        `}
      >
        {description && (
          <span>
            <Tooltip
              id="description-tooltip"
              title={description}
              placement="top"
            >
              <Icons.InfoCircleOutlined
                css={iconStyles}
                onClick={tooltipOnClick}
              />
            </Tooltip>{' '}
          </span>
        )}
        {renderTrigger && (
          <span>
            <InfoTooltip
              label={t('bolt')}
              tooltip={t('Changing this control takes effect instantly')}
              placement="top"
              type="notice"
            />{' '}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="ControlHeader" data-test={`${name}-header`}>
      <div className="pull-left">
        <FormLabel
          css={(theme: ZobiTheme) => css`
            margin-bottom: ${theme.sizeUnit * 0.5}px;
            position: relative;
            font-size: ${theme.fontSizeSM}px;
            overflow: visible;
            padding-bottom: 0.1em;
          `}
          htmlFor={name}
        >
          {leftNode && <span>{leftNode} </span>}
          <span
            role="button"
            tabIndex={0}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : '' }}
          >
            {label}
          </span>{' '}
          {warning && (
            <span>
              <Tooltip id="error-tooltip" placement="top" title={warning}>
                <Icons.WarningOutlined
                  iconColor={theme.colorWarning}
                  css={css`
                    vertical-align: baseline;
                  `}
                  iconSize="s"
                />
              </Tooltip>{' '}
            </span>
          )}
          {danger && (
            <span>
              <Tooltip id="error-tooltip" placement="top" title={danger}>
                <Icons.CloseCircleOutlined
                  iconColor={theme.colorErrorText}
                  iconSize="s"
                />
              </Tooltip>{' '}
            </span>
          )}
          {validationErrors?.length > 0 && (
            <span
              data-test="error-tooltip"
              css={css`
                cursor: pointer;
              `}
            >
              <Tooltip
                id="error-tooltip"
                placement="top"
                title={validationErrors?.join(' ')}
              >
                <Icons.ExclamationCircleOutlined iconColor={theme.colorError} />
              </Tooltip>{' '}
            </span>
          )}
          {renderOptionalIcons()}
        </FormLabel>
      </div>
      {rightNode && <div className="pull-right">{rightNode}</div>}
      <div className="clearfix" />
    </div>
  );
};

export default ControlHeader;
