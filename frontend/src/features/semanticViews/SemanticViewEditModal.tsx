import { useState, useEffect } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { ZobiClient, getClientErrorObject } from '@zobi.dev/core';
import { Input, InputNumber } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import Tabs from '@zobi.dev/core/components/Tabs';
import {
  Table,
  type ColumnsType,
  TableSize,
} from '@zobi.dev/core/components/Table';
import { Alert } from '@zobi.dev/extension-api/components';
import { styled } from '@zobi.dev/extension-api/theme';
import {
  StandardModal,
  ModalFormField,
  MODAL_LARGE_WIDTH,
} from 'src/components/Modal';

const ModalContent = styled.div`
  padding: ${({ theme }) => theme.sizeUnit * 4}px;
`;

type InputNumberValue = number | null;

interface SemanticDimension {
  name: string;
  type: string;
  definition: string | null;
  description: string | null;
  grain: string | null;
}

interface SemanticMetric {
  name: string;
  type: string;
  definition: string;
  description: string | null;
}

interface SemanticViewStructure {
  dimensions: SemanticDimension[];
  metrics: SemanticMetric[];
}

interface SemanticViewEditModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  addDangerToast?: (msg: string) => void;
  addSuccessToast?: (msg: string) => void;
  semanticView: {
    id: number;
    table_name: string;
    description?: string | null;
    cache_timeout?: number | null;
  } | null;
}

const DIMENSION_COLUMNS: ColumnsType<SemanticDimension> = [
  { title: t('Name'), dataIndex: 'name', key: 'name' },
  { title: t('Type'), dataIndex: 'type', key: 'type' },
  { title: t('Grain'), dataIndex: 'grain', key: 'grain' },
  { title: t('Description'), dataIndex: 'description', key: 'description' },
  { title: t('Expression'), dataIndex: 'definition', key: 'definition' },
];

const METRIC_COLUMNS: ColumnsType<SemanticMetric> = [
  { title: t('Name'), dataIndex: 'name', key: 'name' },
  { title: t('Type'), dataIndex: 'type', key: 'type' },
  { title: t('Description'), dataIndex: 'description', key: 'description' },
  { title: t('Definition'), dataIndex: 'definition', key: 'definition' },
];

const STRUCTURE_INFO_MESSAGE = t(
  'Structure is managed by the upstream semantic layer and is read-only.',
);

export default function SemanticViewEditModal({
  show,
  onHide,
  onSave,
  addDangerToast,
  addSuccessToast,
  semanticView,
}: SemanticViewEditModalProps) {
  const [description, setDescription] = useState<string>('');
  const [cacheTimeout, setCacheTimeout] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [structure, setStructure] = useState<SemanticViewStructure | null>(
    null,
  );
  const [structureLoading, setStructureLoading] = useState(false);

  useEffect(() => {
    if (semanticView) {
      setDescription(semanticView.description || '');
      setCacheTimeout(semanticView.cache_timeout ?? null);
    }
  }, [semanticView]);

  useEffect(() => {
    if (show && semanticView) {
      setStructureLoading(true);
      ZobiClient.get({
        endpoint: `/api/v1/semantic_view/${semanticView.id}/structure`,
      })
        .then(({ json }) => {
          setStructure(json.result);
        })
        .catch(async error => {
          const clientError = await getClientErrorObject(error);
          addDangerToast?.(
            clientError.error ||
              t('An error occurred while fetching the semantic view structure'),
          );
        })
        .finally(() => {
          setStructureLoading(false);
        });
    } else {
      setStructure(null);
    }
  }, [show, semanticView]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!semanticView) return;
    setSaving(true);
    try {
      await ZobiClient.put({
        endpoint: `/api/v1/semantic_view/${semanticView.id}`,
        jsonPayload: {
          description: description || null,
          cache_timeout: cacheTimeout,
        },
      });
      addSuccessToast?.(t('Semantic view updated'));
      onSave();
      onHide();
    } catch (error) {
      const clientError = await getClientErrorObject(error);
      addDangerToast?.(
        clientError.error ||
          t('An error occurred while saving the semantic view'),
      );
    } finally {
      setSaving(false);
    }
  };

  const dimensions = structure?.dimensions ?? [];
  const metrics = structure?.metrics ?? [];

  return (
    <StandardModal
      show={show}
      onHide={onHide}
      onSave={handleSave}
      title={t('Edit %s', semanticView?.table_name || '')}
      icon={<Icons.EditOutlined />}
      isEditMode
      width={MODAL_LARGE_WIDTH}
      saveLoading={saving}
      contentLoading={structureLoading}
    >
      <ModalContent>
        <Tabs>
          <Tabs.TabPane tab={t('Details')} key="details">
            <ModalFormField label={t('Description')}>
              <Input.TextArea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </ModalFormField>
            <ModalFormField label={t('Cache timeout')}>
              <InputNumber
                value={cacheTimeout}
                onChange={value => setCacheTimeout(value as InputNumberValue)}
                min={0}
                placeholder={t('Duration in seconds')}
                style={{ width: '100%' }}
              />
            </ModalFormField>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={t('Dimensions (%s)', dimensions.length)}
            key="dimensions"
          >
            <Alert
              type="info"
              message={STRUCTURE_INFO_MESSAGE}
              showIcon
              css={{ marginBottom: 16 }}
            />
            <Table<SemanticDimension>
              data={dimensions}
              columns={DIMENSION_COLUMNS}
              size={TableSize.Small}
              rowKey="name"
              usePagination={false}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('Metrics (%s)', metrics.length)} key="metrics">
            <Alert
              type="info"
              message={STRUCTURE_INFO_MESSAGE}
              showIcon
              css={{ marginBottom: 16 }}
            />
            <Table<SemanticMetric>
              data={metrics}
              columns={METRIC_COLUMNS}
              size={TableSize.Small}
              rowKey="name"
              usePagination={false}
            />
          </Tabs.TabPane>
        </Tabs>
      </ModalContent>
    </StandardModal>
  );
}
