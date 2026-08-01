import { useCallback } from 'react';
import { t } from '@zobi/core/translation';
import { css, styled, useTheme } from '@zobi/core/theme';
import { Icons, InfoTooltip } from '@zobi-ui/core/components';
import {
  CaretContainer,
  CloseContainer,
  OptionControlContainer,
  Label,
} from 'src/explore/components/controls/OptionControls';
import { OptionProps } from 'src/explore/components/controls/DndColumnSelectControl/types';

const StyledInfoTooltip = styled(InfoTooltip)`
  margin: 0 ${({ theme }) => theme.sizeUnit}px;
`;

export default function Option({
  children,
  index,
  clickClose,
  withCaret,
  isExtra,
  datasourceWarningMessage,
  canDelete = true,
  multiValueWarningMessage,
}: OptionProps) {
  const theme = useTheme();
  const onClickClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      clickClose(index);
    },
    [clickClose, index],
  );
  return (
    <OptionControlContainer data-test="option-label" withCaret={withCaret}>
      {canDelete && (
        <CloseContainer
          css={css`
            text-align: center;
          `}
          role="button"
          data-test="remove-control-button"
          onClick={onClickClose}
        >
          <Icons.CloseOutlined
            iconSize="m"
            iconColor={theme.colorIcon}
            css={css`
              vertical-align: sub;
            `}
          />
        </CloseContainer>
      )}
      <Label data-test="control-label">{children}</Label>
      {!!multiValueWarningMessage && (
        <StyledInfoTooltip
          type="warning"
          placement="top"
          tooltip={multiValueWarningMessage}
        />
      )}
      {(!!datasourceWarningMessage || isExtra) && (
        <StyledInfoTooltip
          type="warning"
          placement="top"
          tooltip={
            datasourceWarningMessage ||
            t(`
                This filter was inherited from the dashboard's context.
                It won't be saved when saving the chart.
              `)
          }
        />
      )}
      {withCaret && (
        <CaretContainer>
          <Icons.RightOutlined
            iconSize="m"
            css={css`
              margin: ${theme.sizeUnit}px;
            `}
            iconColor={theme.colorIcon}
          />
        </CaretContainer>
      )}
    </OptionControlContainer>
  );
}
