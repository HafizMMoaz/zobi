import { useCallback, useState } from 'react';
import { useAppDispatch } from 'src/views/store';

import { resetState } from 'src/SqlLab/actions/sqlLab';
import {
  Button,
  EmptyState,
  Flex,
  Icons,
  Popover,
  Typography,
} from '@zobi.dev/core/components';
import { t } from '@zobi.dev/extension-api/translation';
import { styled, css } from '@zobi.dev/extension-api/theme';
import type { SchemaOption, CatalogOption } from 'src/hooks/apiResources';
import { DatabaseSelector, type DatabaseObject } from 'src/components';
import { EMPTY_STATE_QE_ID } from 'src/SqlLab/hooks/useQueryEditor';

import useDatabaseSelector from '../SqlEditorTopBar/useDatabaseSelector';
import TableExploreTree from '../TableExploreTree';

export interface SqlEditorLeftBarProps {
  queryEditorId: string;
}

const LeftBarStyles = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.sizeUnit * 2}px;

  ${({ theme }) => css`
    height: 100%;
    display: flex;
    flex-direction: column;

    .divider {
      border-bottom: 1px solid ${theme.colorSplit};
      margin: ${theme.sizeUnit * 1}px 0;
    }
  `}
`;

const StyledDivider = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colorSplit};
  margin: 0 -${({ theme }) => theme.sizeUnit * 2.5}px 0;
`;

const SqlEditorLeftBar = ({ queryEditorId }: SqlEditorLeftBarProps) => {
  const activeQEId = queryEditorId || EMPTY_STATE_QE_ID;
  const dbSelectorProps = useDatabaseSelector(activeQEId);
  const { db, catalog, schema, onDbChange, onCatalogChange, onSchemaChange } =
    dbSelectorProps;

  const dispatch = useAppDispatch();
  const shouldShowReset = window.location.search === '?reset=1';

  // Modal state for Database/Catalog/Schema selector
  const [selectorModalOpen, setSelectorModalOpen] = useState(false);
  const [modalDb, setModalDb] = useState<DatabaseObject | undefined>(undefined);
  const [modalCatalog, setModalCatalog] = useState<
    CatalogOption | null | undefined
  >(undefined);
  const [modalSchema, setModalSchema] = useState<SchemaOption | undefined>(
    undefined,
  );

  const openSelectorModal = useCallback(() => {
    setModalDb(db ?? undefined);
    setModalCatalog(
      catalog ? { label: catalog, value: catalog, title: catalog } : undefined,
    );
    setModalSchema(
      schema ? { label: schema, value: schema, title: schema } : undefined,
    );
    setSelectorModalOpen(true);
  }, [db, catalog, schema]);

  const closeSelectorModal = useCallback(() => {
    setSelectorModalOpen(false);
  }, []);

  const handleModalOk = useCallback(() => {
    if (modalDb && modalDb.id !== db?.id) {
      onDbChange?.(modalDb);
    }
    if (modalCatalog?.value !== catalog) {
      onCatalogChange?.(modalCatalog?.value);
    }
    if (modalSchema?.value !== schema) {
      onSchemaChange?.(modalSchema?.value ?? '');
    }
    setSelectorModalOpen(false);
  }, [
    modalDb,
    modalCatalog,
    modalSchema,
    db,
    catalog,
    schema,
    onDbChange,
    onCatalogChange,
    onSchemaChange,
  ]);

  const handleResetState = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  const popoverContent = (
    <Flex
      vertical
      gap="middle"
      data-test="DatabaseSelector"
      css={css`
        min-width: 500px;
      `}
    >
      <Typography.Title level={5} style={{ margin: 0 }}>
        {t('Select Database and Schema')}
      </Typography.Title>
      <DatabaseSelector
        key={modalDb ? modalDb.id : 'no-db'}
        db={modalDb}
        emptyState={<EmptyState />}
        getDbList={dbSelectorProps.getDbList}
        handleError={dbSelectorProps.handleError}
        onDbChange={setModalDb}
        onCatalogChange={cat =>
          setModalCatalog(
            cat ? { label: cat, value: cat, title: cat } : undefined,
          )
        }
        catalog={modalCatalog?.value}
        onSchemaChange={sch =>
          setModalSchema(
            sch ? { label: sch, value: sch, title: sch } : undefined,
          )
        }
        schema={modalSchema?.value}
        sqlLabMode={false}
      />
      <Flex justify="flex-end" gap="small">
        <Button
          buttonStyle="tertiary"
          onClick={e => {
            e?.stopPropagation();
            closeSelectorModal();
          }}
        >
          {t('Cancel')}
        </Button>
        <Button
          type="primary"
          onClick={e => {
            e?.stopPropagation();
            handleModalOk();
          }}
        >
          {t('Select')}
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <LeftBarStyles data-test="sql-editor-left-bar">
      <Popover
        content={popoverContent}
        open={selectorModalOpen}
        onOpenChange={open => !open && closeSelectorModal()}
        placement="bottomLeft"
        trigger="click"
      >
        <DatabaseSelector
          key={`db-selector-${db ? db.id : 'no-db'}:${catalog ?? 'no-catalog'}:${
            schema ?? 'no-schema'
          }`}
          {...dbSelectorProps}
          emptyState={<EmptyState />}
          sqlLabMode
          onOpenModal={openSelectorModal}
        />
      </Popover>
      <StyledDivider />
      <TableExploreTree queryEditorId={activeQEId} />
      {shouldShowReset && (
        <Button
          buttonSize="small"
          buttonStyle="danger"
          onClick={handleResetState}
        >
          <Icons.ClearOutlined /> {t('Reset state')}
        </Button>
      )}
    </LeftBarStyles>
  );
};

export default SqlEditorLeftBar;
