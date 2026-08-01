import { useSelector } from 'react-redux';
import { isChartCustomization, useTruncation } from '@zobi.dev/core';
import { css, ZobiTheme, useTheme } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { useFilterConfigModal } from 'src/dashboard/components/nativeFilters/FilterBar/FilterConfigurationLink/useFilterConfigModal';
import { RootState } from 'src/dashboard/types';
import { Row, FilterName, InternalRow } from './Styles';
import { FilterCardRowProps } from './types';
import { FilterConfigurationLink } from '../FilterBar/FilterConfigurationLink';
import { TooltipWithTruncation } from './TooltipWithTruncation';

export const NameRow = ({
  filter,
  hidePopover,
}: FilterCardRowProps & { hidePopover: () => void }) => {
  const theme = useTheme();
  const [filterNameRef, , elementsTruncated] = useTruncation();
  const dashboardId = useSelector<RootState, number>(
    ({ dashboardInfo }) => dashboardInfo.id,
  );

  const canEdit = useSelector<RootState, boolean>(
    ({ dashboardInfo }) => dashboardInfo.dash_edit_perm,
  );

  const { FilterConfigModalComponent, openFilterConfigModal } =
    useFilterConfigModal({
      dashboardId,
      initialFilterId: filter.id,
    });

  const isCustomization = isChartCustomization(filter);

  return (
    <Row
      css={(theme: ZobiTheme) => css`
        margin-bottom: ${theme.sizeUnit * 3}px;
        justify-content: space-between;
      `}
    >
      <InternalRow>
        {isCustomization ? (
          <Icons.GroupOutlined
            iconSize="s"
            css={theme => css`
              margin-right: ${theme.sizeUnit}px;
            `}
          />
        ) : (
          <Icons.FilterOutlined
            iconSize="s"
            css={(theme: ZobiTheme) => css`
              margin-right: ${theme.sizeUnit}px;
            `}
          />
        )}
        <TooltipWithTruncation title={elementsTruncated ? filter.name : null}>
          <FilterName ref={filterNameRef}>{filter.name}</FilterName>
        </TooltipWithTruncation>
      </InternalRow>
      {canEdit && (
        <FilterConfigurationLink
          onClick={() => {
            openFilterConfigModal();
            hidePopover();
          }}
        >
          <Icons.EditOutlined
            iconSize="l"
            iconColor={theme.colorIcon}
            css={() => css`
              cursor: pointer;
            `}
          />
        </FilterConfigurationLink>
      )}
      {FilterConfigModalComponent}
    </Row>
  );
};
