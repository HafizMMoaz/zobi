
import { forwardRef, RefObject, MouseEvent } from 'react';
import { Button } from '@zobi-ui/core/components';
import { ErrorAlert } from 'src/components';
import { styled } from '@zobi/core/theme';

interface ControlPanelAlertProps {
  title: string;
  bodyText: React.ReactNode;
  primaryButtonAction?: (e: MouseEvent) => void;
  secondaryButtonAction?: (e: MouseEvent) => void;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  type: 'info' | 'warning' | 'error';
  className?: string;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.sizeUnit * 4}px;
`;

export const ExploreAlert = forwardRef(
  (
    {
      title,
      bodyText,
      primaryButtonAction,
      secondaryButtonAction,
      primaryButtonText,
      secondaryButtonText,
      type = 'info',
      className = '',
    }: ControlPanelAlertProps,
    ref: RefObject<HTMLDivElement>,
  ) => (
    <ErrorAlert
      errorType={title}
      message={bodyText}
      type={type}
      className={className}
      closable={false}
      showIcon
    >
      {primaryButtonText && primaryButtonAction && (
        <ButtonContainer>
          {secondaryButtonAction && secondaryButtonText && (
            <Button buttonStyle="secondary" onClick={secondaryButtonAction}>
              {secondaryButtonText}
            </Button>
          )}
          <Button buttonStyle="secondary" onClick={primaryButtonAction}>
            {primaryButtonText}
          </Button>
        </ButtonContainer>
      )}
    </ErrorAlert>
  ),
);
