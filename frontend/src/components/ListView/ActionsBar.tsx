
import { ReactElement } from 'react';
import { styled } from '@zobi/core/theme';
import {
  IconNameType,
  Icons,
  type TooltipPlacement,
  ActionButton,
} from '@zobi-ui/core/components';

export type ActionProps = {
  label: string;
  tooltip?: string | ReactElement;
  placement?: TooltipPlacement;
  icon: string;
  onClick: () => void;
};

interface ActionsBarProps {
  actions: Array<ActionProps>;
}

const StyledActions = styled.span`
  white-space: nowrap;
  min-width: 100px;
`;

export function ActionsBar({ actions }: ActionsBarProps) {
  return (
    <StyledActions className="actions">
      {actions.map(({ icon, tooltip, ...rest }, index) => {
        const IconComponent = Icons[icon as IconNameType];
        return (
          <ActionButton
            key={rest.label ?? index}
            icon={<IconComponent iconSize="l" />}
            tooltip={tooltip}
            {...rest}
          />
        );
      })}
    </StyledActions>
  );
}
