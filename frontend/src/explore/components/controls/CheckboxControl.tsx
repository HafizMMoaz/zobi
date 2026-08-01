import { Component, type ReactNode } from 'react';
import { styled, css } from '@zobi/core/theme';
import { Checkbox } from '@zobi-ui/core/components';
import ControlHeader from '../ControlHeader';

interface CheckboxControlProps {
  value?: boolean;
  label?: ReactNode;
  name?: string;
  description?: ReactNode;
  hovered?: boolean;
  onChange?: (value: boolean) => void;
  validationErrors?: string[];
  placeholder?: string;
  debounceDelay?: number;
}

const CheckBoxControlWrapper = styled.div`
  ${({ theme }) => css`
    .ControlHeader label {
      color: ${theme.colorText};
    }
    span:has(label) {
      padding-right: ${theme.sizeUnit * 2}px;
    }
    .ant-checkbox-wrapper {
      font-size: ${theme.fontSizeSM}px;
    }
  `}
`;

export default class CheckboxControl extends Component<CheckboxControlProps> {
  static defaultProps = {
    value: false,
    onChange: () => {},
  };

  onChange = (): void => {
    this.props.onChange?.(!this.props.value);
  };

  renderCheckbox(): ReactNode {
    return <Checkbox onChange={this.onChange} checked={!!this.props.value} />;
  }

  render(): ReactNode {
    if (this.props.label) {
      return (
        <CheckBoxControlWrapper>
          <ControlHeader
            {...this.props}
            leftNode={this.renderCheckbox()}
            onClick={this.onChange}
          />
        </CheckBoxControlWrapper>
      );
    }
    return this.renderCheckbox();
  }
}
