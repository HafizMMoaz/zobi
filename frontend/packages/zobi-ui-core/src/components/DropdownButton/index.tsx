import { Dropdown } from 'antd';
import { kebabCase } from 'lodash';
import { css, useTheme } from '@zobi/core-legacy/theme';
import { Tooltip } from '../Tooltip';
import type { DropdownButtonProps } from './types';

export const DropdownButton = ({
  popupRender,
  tooltip,
  tooltipPlacement,
  children,
  ...rest
}: DropdownButtonProps) => {
  const theme = useTheme();
  const { type: buttonType } = rest;
  // divider implementation for default (non-primary) buttons
  const defaultBtnCss = css`
    ${(!buttonType || buttonType === 'default') &&
    `.ant-dropdown-trigger {
      position: relative;
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 1px;
        height: 100%;
      }
      .anticon {
        vertical-align: middle;
      }
    }`}
  `;
  const button = (
    <Dropdown.Button
      popupRender={popupRender}
      {...rest}
      css={[
        defaultBtnCss,
        css`
          .ant-btn {
            height: 30px;
            box-shadow: none;
            font-size: ${theme.fontSizeSM}px;
            font-weight: ${theme.fontWeightStrong};
          }
        `,
      ]}
    >
      {children}
    </Dropdown.Button>
  );
  if (tooltip) {
    return (
      <Tooltip
        placement={tooltipPlacement}
        id={`${kebabCase(tooltip)}-tooltip`}
        title={tooltip}
      >
        {button}
      </Tooltip>
    );
  }
  return button;
};

export type { DropdownButtonProps };
