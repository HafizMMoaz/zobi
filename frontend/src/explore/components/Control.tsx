import { ReactNode, useCallback, useState, useEffect } from 'react';
import { isEqual } from 'lodash';
import {
  ControlType,
  ControlComponentProps as BaseControlComponentProps,
} from '@zobi-ui/chart-controls';
import { JsonValue, QueryFormData, usePrevious } from '@zobi-ui/core';
import { styled } from '@zobi/core/theme';
import { ErrorBoundary } from 'src/components';
import { ExploreActions } from 'src/explore/actions/exploreActions';
import controlMap from './controls';

export type ControlProps = {
  // the actual action dispatcher (via bindActionCreators) has identical
  // signature to the original action factory.
  actions: Partial<ExploreActions> & Pick<ExploreActions, 'setControlValue'>;
  type: ControlType;
  label?: ReactNode;
  name: string;
  description?: ReactNode;
  tooltipOnClick?: () => ReactNode;
  places?: number;
  rightNode?: ReactNode;
  formData?: QueryFormData | null;
  value?: JsonValue;
  validationErrors?: any[];
  hidden?: boolean;
  renderTrigger?: boolean;
  default?: JsonValue;
  isVisible?: boolean;
  resetOnHide?: boolean;
};

/**
 *
 */
export type ControlComponentProps<ValueType extends JsonValue = JsonValue> =
  Omit<ControlProps, 'value'> & BaseControlComponentProps<ValueType>;

const StyledControl = styled.div`
  padding-bottom: ${({ theme }) => theme.sizeUnit * 4}px;
`;

export default function Control(props: ControlProps) {
  const {
    actions: { setControlValue },
    name,
    type,
    hidden,
    isVisible,
    resetOnHide = true,
  } = props;

  const [hovered, setHovered] = useState(false);
  const wasVisible = usePrevious(isVisible);
  const onChange = useCallback(
    (value: any, errors: any[]) => setControlValue(name, value, errors),
    [name, setControlValue],
  );

  useEffect(() => {
    if (
      wasVisible === true &&
      isVisible === false &&
      props.default !== undefined &&
      !isEqual(props.value, props.default) &&
      resetOnHide
    ) {
      // reset control value if setting to invisible
      setControlValue?.(name, props.default);
    }
  }, [
    name,
    wasVisible,
    isVisible,
    setControlValue,
    props.value,
    props.default,
  ]);

  if (!type || isVisible === false) return null;

  const ControlComponent =
    typeof type === 'string'
      ? controlMap[type as keyof typeof controlMap]
      : type;
  if (!ControlComponent) {
    // eslint-disable-next-line no-console
    console.warn(`Unknown controlType: ${type}`);
    return null;
  }

  return (
    <StyledControl
      className="Control"
      data-test={name}
      style={hidden ? { display: 'none' } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ErrorBoundary>
        <ControlComponent onChange={onChange} hovered={hovered} {...props} />
      </ErrorBoundary>
    </StyledControl>
  );
}
