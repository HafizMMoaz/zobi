import { useEffect, useState } from 'react';
import { t } from '@zobi/core/translation';
import { styled, css, ZobiTheme } from '@zobi/core/theme';
import { NumberParam, useQueryParam } from 'use-query-params';
import AllEntitiesTable from 'src/features/allEntities/AllEntitiesTable';
import { Button, Loading } from '@zobi-ui/core/components';
import MetadataBar, {
  MetadataType,
  Description,
  Owner,
  LastModified,
} from '@zobi-ui/core/components/MetadataBar';
import { PageHeaderWithActions } from '@zobi-ui/core/components/PageHeaderWithActions';
import { Tag } from 'src/views/CRUD/types';
import TagModal from 'src/features/tags/TagModal';
import withToasts, { useToasts } from 'src/components/MessageToasts/withToasts';
import { fetchObjectsByTagIds, fetchSingleTag } from 'src/features/tags/tags';
import getOwnerName from 'src/utils/getOwnerName';
import { TaggedObject, TaggedObjects } from 'src/types/TaggedObject';
import { findPermission } from 'src/utils/findPermission';
import { useSelector } from 'react-redux';
import { RootState } from 'src/dashboard/types';

const additionalItemsStyles = (theme: ZobiTheme) => css`
  display: flex;
  align-items: center;
  margin-left: ${theme.sizeUnit}px;
  & > span {
    margin-right: ${theme.sizeUnit * 3}px;
  }
`;

const AllEntitiesContainer = styled.div`
  ${({ theme }) => `
  background-color: ${theme.colorBgContainer};
  .select-control {
    margin-left: ${theme.sizeUnit * 4}px;
    margin-right: ${theme.sizeUnit * 4}px;
    margin-bottom: ${theme.sizeUnit * 2}px;
  }
  .select-control-label {
    font-size: ${theme.sizeUnit * 3}px;
    color: ${theme.colorText};
    margin-bottom: ${theme.sizeUnit * 1}px;
  }
  .entities {
    margin: ${theme.sizeUnit * 6}px; 0px;
  }
  .pagination-container {
    background-color: transparent;
  }
  `}
`;

const AllEntitiesNav = styled.div`
  ${({ theme }) => `
  height: ${theme.sizeUnit * 12.5}px;
  background-color: ${theme.colorBgBase};
  margin-bottom: ${theme.sizeUnit * 4}px;
  .navbar-brand {
    margin-left: ${theme.sizeUnit * 2}px;
    font-weight: ${theme.fontWeightStrong};
  }
  .header {
    font-weight: ${theme.fontWeightStrong};
    margin-right:  ${theme.sizeUnit * 3}px;
    text-align: left;
    font-size: ${theme.sizeUnit * 4.5}px;
    padding: ${theme.sizeUnit * 3}px;
    display: inline-block;
    line-height: ${theme.sizeUnit * 9}px;
  }
  `};
`;

function AllEntities() {
  const [tagId] = useQueryParam('id', NumberParam);
  const [tag, setTag] = useState<Tag | null>(null);
  const [showTagModal, setShowTagModal] = useState<boolean>(false);
  const { addSuccessToast, addDangerToast } = useToasts();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [objects, setObjects] = useState<TaggedObjects>({
    dashboard: [],
    chart: [],
    query: [],
  });

  const canEditTag = useSelector((state: RootState) =>
    findPermission('can_write', 'Tag', state.user?.roles),
  );

  const editableTitleProps = {
    title: tag?.name || '',
    placeholder: 'testing',
    onSave: () => {},
    canEdit: false,
    label: t('dataset name'),
  };

  const items = [];
  if (tag?.description) {
    const description: Description = {
      type: MetadataType.Description,
      value: tag?.description || '',
    };
    items.push(description);
  }

  const owner: Owner = {
    type: MetadataType.Owner,
    createdBy: getOwnerName(tag?.created_by),
    createdOn: tag?.created_on_delta_humanized || '',
  };
  items.push(owner);

  const lastModified: LastModified = {
    type: MetadataType.LastModified,
    value: tag?.changed_on_delta_humanized || '',
    modifiedBy: getOwnerName(tag?.changed_by),
  };
  items.push(lastModified);

  const fetchTaggedObjects = () => {
    setLoading(true);
    if (!tag) {
      addDangerToast('Error tag object is not referenced!');
      return;
    }
    fetchObjectsByTagIds(
      { tagIds: tag?.id !== undefined ? [tag.id] : '', types: null },
      (data: TaggedObject[]) => {
        const objects: TaggedObjects = { dashboard: [], chart: [], query: [] };
        data.forEach(function (object) {
          const object_type = object.type;
          objects[object_type as keyof TaggedObjects].push(object);
        });
        setObjects(objects);
        setLoading(false);
      },
      (error: Response) => {
        addDangerToast('Error Fetching Tagged Objects');
        setLoading(false);
      },
    );
  };

  const fetchTag = (tagId: number) => {
    fetchSingleTag(
      tagId,
      (tag: Tag) => {
        setTag(tag);
        setLoading(false);
      },
      (error: Response) => {
        addDangerToast(t('Error Fetching Tagged Objects'));
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    // fetch single tag met
    if (tagId) {
      setLoading(true);
      fetchTag(tagId);
    }
  }, [tagId]);

  useEffect(() => {
    if (tag) fetchTaggedObjects();
  }, [tag]);

  if (isLoading) return <Loading />;
  return (
    <AllEntitiesContainer>
      <TagModal
        show={showTagModal}
        onHide={() => {
          setShowTagModal(false);
        }}
        editTag={tag}
        addSuccessToast={addSuccessToast}
        addDangerToast={addDangerToast}
        refreshData={() => {
          fetchTaggedObjects();
          if (tagId) fetchTag(tagId);
        }}
      />
      <AllEntitiesNav>
        <PageHeaderWithActions
          additionalActionsMenu={<></>}
          editableTitleProps={editableTitleProps}
          faveStarProps={{ itemId: 1, saveFaveStar: () => {} }}
          showFaveStar={false}
          showTitlePanelItems
          titlePanelAdditionalItems={
            <div css={additionalItemsStyles}>
              <MetadataBar items={items} tooltipPlacement="bottom" />
            </div>
          }
          rightPanelAdditionalItems={
            <>
              {canEditTag && (
                <Button
                  data-test="bulk-select-action"
                  buttonStyle="secondary"
                  onClick={() => setShowTagModal(true)}
                  showMarginRight={false}
                >
                  {t('Edit tag')}{' '}
                </Button>
              )}
            </>
          }
          menuDropdownProps={{
            disabled: true,
          }}
          showMenuDropdown={false}
        />
      </AllEntitiesNav>
      <div className="entities">
        <AllEntitiesTable
          search={tag?.name || ''}
          setShowTagModal={setShowTagModal}
          objects={objects}
          canEditTag={canEditTag}
        />
      </div>
    </AllEntitiesContainer>
  );
}

export default withToasts(AllEntities);
