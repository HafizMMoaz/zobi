import { useCallback, useEffect, useMemo, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled, css } from '@zobi.dev/extension-api/theme';
import { Alert } from '@zobi.dev/extension-api/components';
import {
  Button,
  DeleteModal,
  Loading,
  Space,
  Table,
  TableSize,
  Tag,
  Tooltip,
} from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Typography } from '@zobi.dev/core/components/Typography';
import SubMenu from 'src/features/home/SubMenu';
import withToasts from 'src/components/MessageToasts/withToasts';
import ModelModal from 'src/features/llm/ModelModal';
import ProviderModal from 'src/features/llm/ProviderModal';
import RouterConfigPanel from 'src/features/llm/RouterConfigPanel';
import {
  deleteModel,
  deleteProvider,
  fetchModels,
  fetchProviders,
  fetchProviderSpecs,
} from 'src/features/llm/api';
import { CHECK_LOGS_HINT, describeApiError } from 'src/features/llm/errors';
import {
  LLMModelObject,
  LLMProviderObject,
  ProviderSpec,
} from 'src/features/llm/types';

const PageContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.sizeUnit * 4}px;
  `}
`;

const StatusDot = styled.span<{ tone: 'ok' | 'error' | 'unknown' }>`
  ${({ theme, tone }) => css`
    display: inline-block;
    width: ${theme.sizeUnit * 2}px;
    height: ${theme.sizeUnit * 2}px;
    border-radius: 50%;
    margin-right: ${theme.sizeUnit}px;
    background: ${tone === 'ok'
      ? theme.colorSuccess
      : tone === 'error'
        ? theme.colorError
        : theme.colorTextQuaternary};
  `}
`;

const InactiveTag = styled(Tag)`
  ${({ theme }) => css`
    margin-left: ${theme.sizeUnit}px;
  `}
`;

interface LLMProviderListProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
}

function LLMProviderList({
  addDangerToast,
  addSuccessToast,
}: LLMProviderListProps) {
  const [loading, setLoading] = useState(true);
  const [specs, setSpecs] = useState<ProviderSpec[]>([]);
  const [providers, setProviders] = useState<LLMProviderObject[]>([]);
  const [models, setModels] = useState<LLMModelObject[]>([]);

  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] =
    useState<LLMProviderObject | null>(null);
  const [providerToDelete, setProviderToDelete] =
    useState<LLMProviderObject | null>(null);

  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModelObject | null>(null);
  const [modelProviderId, setModelProviderId] = useState<number | null>(null);
  const [modelToDelete, setModelToDelete] = useState<LLMModelObject | null>(
    null,
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextProviders, nextModels] = await Promise.all([
        fetchProviders(),
        fetchModels(),
      ]);
      setProviders(nextProviders);
      setModels(nextModels);
    } catch {
      addDangerToast(t('Could not load AI model configuration.'));
    } finally {
      setLoading(false);
    }
  }, [addDangerToast]);

  useEffect(() => {
    fetchProviderSpecs()
      .then(setSpecs)
      .catch(() => addDangerToast(t('Could not load provider list.')));
    refresh();
  }, [refresh, addDangerToast]);

  const modelsByProvider = useMemo(() => {
    const grouped = new Map<number, LLMModelObject[]>();
    models.forEach(model => {
      const existing = grouped.get(model.provider_id) ?? [];
      existing.push(model);
      grouped.set(model.provider_id, existing);
    });
    return grouped;
  }, [models]);

  /** Aliases used more than once are load-balanced pools worth flagging. */
  const pooledAliases = useMemo(() => {
    const counts = new Map<string, number>();
    models.forEach(model =>
      counts.set(model.alias, (counts.get(model.alias) ?? 0) + 1),
    );
    return new Set(
      [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([alias]) => alias),
    );
  }, [models]);

  const aliases = useMemo(
    () => [...new Set(models.map(model => model.alias))].sort(),
    [models],
  );

  const handleDeleteProvider = async () => {
    if (!providerToDelete?.id) return;
    try {
      await deleteProvider(providerToDelete.id);
      addSuccessToast(t('Provider deleted'));
      refresh();
    } catch (error) {
      addDangerToast(
        await describeApiError(
          error,
          t('Could not delete the provider. %s', CHECK_LOGS_HINT),
        ),
      );
    } finally {
      setProviderToDelete(null);
    }
  };

  const handleDeleteModel = async () => {
    if (!modelToDelete?.id) return;
    try {
      await deleteModel(modelToDelete.id);
      addSuccessToast(t('Model deleted'));
      refresh();
    } catch (error) {
      // The API refuses to delete the last model behind a routed alias and
      // says so in its 422 body, so prefer that message over the generic one.
      addDangerToast(
        await describeApiError(
          error,
          t(
            'Could not delete this model. If routing points at its alias, ' +
              'update the routing settings first.',
          ),
        ),
      );
    } finally {
      setModelToDelete(null);
    }
  };

  const providerStatus = (provider: LLMProviderObject) => {
    if (!provider.last_tested_at) return 'unknown' as const;
    return provider.last_test_error ? ('error' as const) : ('ok' as const);
  };

  const modelColumns = [
    {
      title: t('Alias'),
      dataIndex: 'alias',
      key: 'alias',
      render: (alias: string) => (
        <Space>
          {alias}
          {pooledAliases.has(alias) && (
            <Tooltip
              title={t('Shared with another model - requests are balanced')}
            >
              <Tag color="blue">{t('pooled')}</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    { title: t('Model'), dataIndex: 'model_string', key: 'model_string' },
    {
      title: t('Capabilities'),
      key: 'capabilities',
      render: (_: unknown, model: LLMModelObject) => (
        <Space size={4}>
          {model.supports_chat && <Tag>{t('chat')}</Tag>}
          {model.supports_transcription && <Tag>{t('audio')}</Tag>}
          {model.supports_embeddings && <Tag>{t('embed')}</Tag>}
          {model.supports_vision && <Tag>{t('vision')}</Tag>}
        </Space>
      ),
    },
    {
      title: t('Limits'),
      key: 'limits',
      render: (_: unknown, model: LLMModelObject) => {
        const parts = [
          model.rpm ? t('%s rpm', model.rpm) : null,
          model.tpm ? t('%s tpm', model.tpm) : null,
        ].filter(Boolean);
        return parts.length ? parts.join(' · ') : '—';
      },
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_: unknown, model: LLMModelObject) => (
        <Space>
          <Button
            buttonStyle="link"
            onClick={() => {
              setEditingModel(model);
              setModelProviderId(model.provider_id);
              setModelModalOpen(true);
            }}
          >
            <Icons.EditOutlined />
          </Button>
          <Button buttonStyle="link" onClick={() => setModelToDelete(model)}>
            <Icons.DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const providerColumns = [
    {
      title: t('Provider'),
      key: 'name',
      render: (_: unknown, provider: LLMProviderObject) => (
        <Space>
          <Tooltip
            title={
              provider.last_test_error ||
              (provider.last_tested_at
                ? t('Last test succeeded')
                : t('Not tested yet'))
            }
          >
            <StatusDot tone={providerStatus(provider)} />
          </Tooltip>
          <strong>{provider.name}</strong>
          {!provider.is_active && <InactiveTag>{t('inactive')}</InactiveTag>}
        </Space>
      ),
    },
    { title: t('Type'), dataIndex: 'provider_key', key: 'provider_key' },
    {
      title: t('Models'),
      key: 'model_count',
      render: (_: unknown, provider: LLMProviderObject) =>
        modelsByProvider.get(provider.id as number)?.length ?? 0,
    },
    {
      title: t('Last modified'),
      dataIndex: 'changed_on_delta_humanized',
      key: 'changed_on_delta_humanized',
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_: unknown, provider: LLMProviderObject) => (
        <Space>
          <Button
            buttonStyle="link"
            onClick={() => {
              setEditingModel(null);
              setModelProviderId(provider.id ?? null);
              setModelModalOpen(true);
            }}
          >
            {t('Add model')}
          </Button>
          <Button
            buttonStyle="link"
            onClick={() => {
              setEditingProvider(provider);
              setProviderModalOpen(true);
            }}
          >
            <Icons.EditOutlined />
          </Button>
          <Button
            buttonStyle="link"
            onClick={() => setProviderToDelete(provider)}
          >
            <Icons.DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <SubMenu
        name={t('AI Models')}
        buttons={[
          {
            name: (
              <>
                <Icons.PlusOutlined /> {t('Provider')}
              </>
            ),
            buttonStyle: 'primary',
            onClick: () => {
              setEditingProvider(null);
              setProviderModalOpen(true);
            },
          },
        ]}
      />

      <PageContainer>
        {loading ? (
          <Loading />
        ) : (
          <>
            {!providers.length && (
              <Alert
                type="info"
                showIcon
                message={t('No model providers yet')}
                description={t(
                  'Connect a provider to give Zobi access to a language ' +
                    'model. Credentials are encrypted and never shown again ' +
                    'once saved.',
                )}
              />
            )}

            {providers.length > 0 && (
              <>
                <RouterConfigPanel aliases={aliases} />

                <Table
                  rowKey="id"
                  columns={providerColumns}
                  data={providers}
                  pagination={false}
                  expandable={{
                    expandedRowRender: (provider: LLMProviderObject) => {
                      const providerModels =
                        modelsByProvider.get(provider.id as number) ?? [];
                      return providerModels.length ? (
                        <Table
                          rowKey="id"
                          columns={modelColumns}
                          data={providerModels}
                          pagination={false}
                          size={TableSize.Small}
                        />
                      ) : (
                        <Typography.Text type="secondary">
                          {t('No models configured for this provider yet.')}
                        </Typography.Text>
                      );
                    },
                  }}
                />
              </>
            )}
          </>
        )}
      </PageContainer>

      <ProviderModal
        specs={specs}
        provider={editingProvider}
        show={providerModalOpen}
        onHide={() => setProviderModalOpen(false)}
        onSaved={refresh}
      />

      <ModelModal
        providers={providers}
        specs={specs}
        model={editingModel}
        defaultProviderId={modelProviderId}
        show={modelModalOpen}
        onHide={() => setModelModalOpen(false)}
        onSaved={refresh}
      />

      {providerToDelete && (
        <DeleteModal
          description={t(
            'Deleting this provider also deletes every model under it, and ' +
              'any Zobi feature using those models will stop working.',
          )}
          onConfirm={handleDeleteProvider}
          onHide={() => setProviderToDelete(null)}
          open
          title={t('Delete provider?')}
        />
      )}

      {modelToDelete && (
        <DeleteModal
          description={t(
            'Anything routed to this model will fall back or fail.',
          )}
          onConfirm={handleDeleteModel}
          onHide={() => setModelToDelete(null)}
          open
          title={t('Delete model?')}
        />
      )}
    </>
  );
}

export default withToasts(LLMProviderList);
