import { Dispatch } from 'react';
import { t } from '@zobi/core/translation';
import { PageHeaderWithActions } from '@zobi-ui/core/components/PageHeaderWithActions';
import { Button } from '@zobi-ui/core/components';
import { TooltipPlacement } from '@zobi-ui/core/components/Tooltip/types';
import { Icons } from '@zobi-ui/core/components/Icons';
import { Menu } from '@zobi-ui/core/components/Menu';
import {
  DatasetActionType,
  DSReducerActionType,
} from 'src/features/datasets/AddDataset/types';
import {
  HeaderComponentStyles,
  disabledSaveBtnStyles,
  StyledCreateDatasetTitle,
} from '../../styles';

export const DEFAULT_TITLE = t('New dataset');

const tooltipProps: { text: string; placement: TooltipPlacement } = {
  text: t('Select a database table and create dataset'),
  placement: 'bottomRight',
};

const renderDisabledSaveButton = () => (
  <Button
    buttonStyle="primary"
    tooltip={tooltipProps?.text}
    placement={tooltipProps?.placement}
    disabled
    css={disabledSaveBtnStyles}
  >
    <Icons.SaveOutlined iconSize="m" />
    {t('Save')}
  </Button>
);

const renderOverlay = () => (
  <Menu
    items={[
      { key: 'settings', label: t('Settings') },
      { key: 'delete', label: t('Delete') },
    ]}
  />
);

export default function Header({
  setDataset,
  title = DEFAULT_TITLE,
  editing = false,
}: {
  setDataset: Dispatch<DSReducerActionType>;
  title?: string | null | undefined;
  schema?: string | null | undefined;
  editing?: boolean;
}) {
  const editableTitleProps = {
    title: title ?? DEFAULT_TITLE,
    placeholder: DEFAULT_TITLE,
    onSave: (newDatasetName: string) => {
      setDataset({
        type: DatasetActionType.ChangeDataset,
        payload: { name: 'dataset_name', value: newDatasetName },
      });
    },
    canEdit: false,
    label: t('dataset name'),
  };

  return (
    <HeaderComponentStyles>
      {editing ? (
        <PageHeaderWithActions
          editableTitleProps={editableTitleProps}
          showTitlePanelItems={false}
          showFaveStar={false}
          faveStarProps={{ itemId: 1, saveFaveStar: () => {} }}
          titlePanelAdditionalItems={<></>}
          rightPanelAdditionalItems={renderDisabledSaveButton()}
          additionalActionsMenu={renderOverlay()}
          menuDropdownProps={{
            disabled: true,
          }}
          tooltipProps={tooltipProps}
        />
      ) : (
        <StyledCreateDatasetTitle>
          {title || DEFAULT_TITLE}
        </StyledCreateDatasetTitle>
      )}
    </HeaderComponentStyles>
  );
}
