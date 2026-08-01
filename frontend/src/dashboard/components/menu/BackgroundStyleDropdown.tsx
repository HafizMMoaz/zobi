import { PureComponent } from 'react';
import cx from 'classnames';
import { t } from '@zobi/core/translation';
import { css, styled } from '@zobi/core/theme';

import backgroundStyleOptions from 'src/dashboard/util/backgroundStyleOptions';
import PopoverDropdown, {
  OptionProps,
  OnChangeHandler,
} from '@zobi-ui/core/components/PopoverDropdown';

interface BackgroundStyleDropdownProps {
  id: string;
  value: string;
  onChange: OnChangeHandler;
}

const BackgroundStyleOption = styled.div`
  ${({ theme }) => css`
    display: inline-block;
    &:before {
      content: '';
      width: 1em;
      height: 1em;
      margin-right: ${theme.sizeUnit * 2}px;
      display: inline-block;
      vertical-align: middle;
    }
    &.background-style-option.background--white {
      padding-left: 0;
      background: transparent;
      &:before {
        background: ${theme.colorBgContainer};
        border: 1px solid ${theme.colorBorder};
      }
    }
    /* Create the transparent rect icon */
    &.background--transparent:before {
      background-image:
        linear-gradient(45deg, ${theme.colorTextLabel} 25%, transparent 25%),
        linear-gradient(-45deg, ${theme.colorTextLabel} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${theme.colorTextLabel} 75%),
        linear-gradient(-45deg, transparent 75%, ${theme.colorTextLabel} 75%);
      background-size: ${theme.sizeUnit * 2}px ${theme.sizeUnit * 2}px;
      background-position:
        0 0,
        0 ${theme.sizeUnit}px,
        ${theme.sizeUnit}px ${-theme.sizeUnit}px,
        ${-theme.sizeUnit}px 0px;
    }
  `}
`;

function renderButton(option: OptionProps) {
  const BACKGROUND_TEXT = t('background');
  return (
    <BackgroundStyleOption
      className={cx('background-style-option', option.className)}
    >
      {`${option.label} ${BACKGROUND_TEXT}`}
    </BackgroundStyleOption>
  );
}

function renderOption(option: OptionProps) {
  return (
    <BackgroundStyleOption
      className={cx('background-style-option', option.className)}
    >
      {option.label}
    </BackgroundStyleOption>
  );
}

export default class BackgroundStyleDropdown extends PureComponent<BackgroundStyleDropdownProps> {
  render() {
    const { id, value, onChange } = this.props;
    return (
      <PopoverDropdown
        id={id}
        options={backgroundStyleOptions}
        value={value}
        onChange={onChange}
        renderButton={renderButton}
        renderOption={renderOption}
      />
    );
  }
}
