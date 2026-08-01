import { ReactChild, RefObject, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { t } from '@zobi.dev/extension-api/translation';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { Button, ModalTrigger } from '@zobi.dev/core/components';

export const ViewResultsModalTrigger = ({
  canExplore,
  exploreUrl,
  triggerNode,
  modalTitle,
  modalBody,
  modalRef,
}: {
  canExplore?: boolean;
  exploreUrl: string;
  triggerNode: ReactChild;
  modalTitle: string;
  modalBody: ReactChild;
  modalRef?: RefObject<any>;
}) => {
  const history = useHistory();
  const exploreChart = () => history.push(exploreUrl);
  const theme = useTheme();
  const handleCloseModal = useCallback(() => {
    modalRef?.current?.close();
  }, [modalRef]);
  return (
    <ModalTrigger
      ref={modalRef}
      triggerNode={triggerNode}
      modalTitle={modalTitle}
      modalBody={modalBody}
      responsive
      resizable
      resizableConfig={{
        minHeight: theme.sizeUnit * 128,
        minWidth: theme.sizeUnit * 128,
        defaultSize: {
          width: 'auto',
          height: '75vh',
        },
      }}
      draggable
      destroyOnHidden
      modalFooter={
        <>
          <Button
            buttonStyle="secondary"
            buttonSize="small"
            onClick={exploreChart}
            disabled={!canExplore}
            tooltip={
              !canExplore
                ? t('You do not have sufficient permissions to edit the chart')
                : undefined
            }
          >
            {t('Edit chart')}
          </Button>
          <Button
            buttonStyle="primary"
            buttonSize="small"
            onClick={handleCloseModal}
            css={css`
              margin-left: ${theme.sizeUnit * 2}px;
            `}
          >
            {t('Close')}
          </Button>
        </>
      }
    />
  );
};
