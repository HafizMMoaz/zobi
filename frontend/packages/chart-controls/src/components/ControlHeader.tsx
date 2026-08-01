import { ReactNode } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css } from '@zobi.dev/extension-api/theme';
import { InfoTooltip, Tooltip, Icons } from '@zobi.dev/core/components';

type ValidationError = string;

export type ControlHeaderProps = {
  name?: string;
  label?: ReactNode;
  description?: ReactNode;
  validationErrors?: ValidationError[];
  renderTrigger?: boolean;
  rightNode?: ReactNode;
  leftNode?: ReactNode;
  hovered?: boolean;
  required?: boolean;
  warning?: string;
  danger?: string;
  onClick?: () => void;
  tooltipOnClick?: () => void;
};

export function ControlHeader({
  name,
  description,
  label,
  tooltipOnClick,
  onClick,
  warning,
  danger,
  leftNode,
  rightNode,
  validationErrors = [],
  renderTrigger = false,
  hovered = false,
  required = false,
}: ControlHeaderProps) {
  const renderOptionalIcons = () => {
    if (hovered) {
      return (
        <span>
          {description && (
            <span>
              <InfoTooltip
                label={t('description')}
                tooltip={description}
                placement="top"
                onClick={tooltipOnClick}
              />{' '}
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
    }
    return null;
  };

  if (!label) {
    return null;
  }
  const labelClass = validationErrors.length > 0 ? 'text-danger' : '';

  return (
    <div className="ControlHeader" data-test={`${name}-header`}>
      <div className="pull-left">
        <label className="control-label" htmlFor={name}>
          {leftNode && <>{leftNode}</>}
          <span
            role={onClick ? 'button' : undefined}
            {...(onClick ? { onClick, tabIndex: 0 } : {})}
            className={labelClass}
          >
            {label}
          </span>{' '}
          {warning && (
            <span>
              <Tooltip id="error-tooltip" placement="top" title={warning}>
                <Icons.InfoCircleOutlined
                  iconSize="m"
                  css={theme => css`
                    color: ${theme.colorError};
                  `}
                />
              </Tooltip>{' '}
            </span>
          )}
          {danger && (
            <span>
              <Tooltip id="error-tooltip" placement="top" title={danger}>
                <Icons.InfoCircleOutlined
                  iconSize="m"
                  css={theme => css`
                    color: ${theme.colorError};
                  `}
                />{' '}
              </Tooltip>{' '}
            </span>
          )}
          {validationErrors.length > 0 && (
            <span>
              <Tooltip
                id="error-tooltip"
                placement="top"
                title={validationErrors.join(' ')}
              >
                <Icons.InfoCircleOutlined
                  iconSize="m"
                  css={theme => css`
                    color: ${theme.colorError};
                  `}
                />{' '}
              </Tooltip>{' '}
            </span>
          )}
          {renderOptionalIcons()}
          {required && <strong> *</strong>}
        </label>
      </div>
      {rightNode && <div className="pull-right">{rightNode}</div>}
      <div className="clearfix" />
    </div>
  );
}
