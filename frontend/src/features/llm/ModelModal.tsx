import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled, css } from '@zobi.dev/extension-api/theme';
import {
  AutoComplete,
  Button,
  Checkbox,
  Collapse,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
} from '@zobi.dev/core/components';
import { Typography } from '@zobi.dev/core/components/Typography';
import withToasts from 'src/components/MessageToasts/withToasts';
import { createModel, fetchProviderModels, updateModel } from './api';
import { CHECK_LOGS_HINT, describeApiError } from './errors';
import { LLMModelObject, LLMProviderObject, ProviderSpec } from './types';

const HelpText = styled(Typography.Paragraph)`
  ${({ theme }) => css`
    color: ${theme.colorTextSecondary};
    font-size: ${theme.fontSizeSM}px;
    margin-bottom: ${theme.sizeUnit * 2}px;
  `}
`;

const LimitsGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: ${theme.sizeUnit * 3}px;
  `}
`;

const CAPABILITIES: {
  field: keyof LLMModelObject;
  label: string;
  hint: string;
}[] = [
  {
    field: 'supports_chat',
    label: t('Chat'),
    hint: t('Conversation and tool calling'),
  },
  {
    field: 'supports_transcription',
    label: t('Transcription'),
    hint: t('Speech to text'),
  },
  {
    field: 'supports_embeddings',
    label: t('Embeddings'),
    hint: t('Vector representations'),
  },
  {
    field: 'supports_vision',
    label: t('Vision'),
    hint: t('Image understanding'),
  },
];

/**
 * Turn a vendor model id into a usable alias.
 *
 * Vendor ids are often namespaced ("anthropic/claude-opus-4",
 * "accounts/fireworks/models/llama-v3"), and the trailing segment is the part
 * an operator recognises. Lowercased and stripped of characters that would
 * make the alias awkward to type in routing settings.
 */
export function deriveAlias(modelString: string): string {
  const lastSegment = modelString.split('/').pop() ?? modelString;
  return (
    lastSegment
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || lastSegment
  );
}

interface ModelModalProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  providers: LLMProviderObject[];
  specs: ProviderSpec[];
  model?: LLMModelObject | null;
  defaultProviderId?: number | null;
  show: boolean;
  onHide: () => void;
  onSaved: () => void;
}

const ModelModal: FunctionComponent<ModelModalProps> = ({
  addDangerToast,
  addSuccessToast,
  providers,
  specs,
  model,
  defaultProviderId,
  show,
  onHide,
  onSaved,
}) => {
  const isEdit = Boolean(model?.id);

  const [providerId, setProviderId] = useState<number | null>(null);
  const [alias, setAlias] = useState('');
  // A list even when editing, so one code path covers both modes. Edit mode
  // holds exactly one entry.
  const [modelStrings, setModelStrings] = useState<string[]>([]);
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<Record<string, boolean>>({
    supports_chat: true,
    supports_transcription: false,
    supports_embeddings: false,
    supports_vision: false,
  });
  const [limits, setLimits] = useState<Record<string, number | null>>({
    tpm: null,
    rpm: null,
    max_parallel_requests: null,
    max_budget: null,
  });
  const [budgetDuration, setBudgetDuration] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalogue, setCatalogue] = useState<string[]>([]);

  const spec = useMemo(() => {
    const provider = providers.find(candidate => candidate.id === providerId);
    return specs.find(candidate => candidate.key === provider?.provider_key);
  }, [providers, specs, providerId]);

  useEffect(() => {
    if (!show) return;
    if (model) {
      setProviderId(model.provider_id);
      setAlias(model.alias);
      setModelStrings([model.model_string]);
      setCapabilities({
        supports_chat: Boolean(model.supports_chat),
        supports_transcription: Boolean(model.supports_transcription),
        supports_embeddings: Boolean(model.supports_embeddings),
        supports_vision: Boolean(model.supports_vision),
      });
      setLimits({
        tpm: model.tpm ?? null,
        rpm: model.rpm ?? null,
        max_parallel_requests: model.max_parallel_requests ?? null,
        max_budget: model.max_budget ?? null,
      });
      setBudgetDuration(model.budget_duration ?? '');
      setIsActive(model.is_active ?? true);
    } else {
      setProviderId(defaultProviderId ?? null);
      setAlias('');
      setModelStrings([]);
      setCapabilities({
        supports_chat: true,
        supports_transcription: false,
        supports_embeddings: false,
        supports_vision: false,
      });
      setLimits({
        tpm: null,
        rpm: null,
        max_parallel_requests: null,
        max_budget: null,
      });
      setBudgetDuration('');
      setIsActive(true);
    }
  }, [show, model, defaultProviderId]);

  useEffect(() => {
    // A catalogue is a convenience: providers without one return [], and the
    // model string stays free-text.
    if (!show || !providerId || !spec?.supports_model_listing) {
      setCatalogue([]);
      setCatalogueLoading(false);
      return;
    }
    setCatalogueLoading(true);
    fetchProviderModels(providerId)
      .then(setCatalogue)
      .catch(() => setCatalogue([]))
      .finally(() => setCatalogueLoading(false));
  }, [show, providerId, spec]);

  const hasCapability = Object.values(capabilities).some(Boolean);
  const isSingle = modelStrings.length === 1;
  const canSave =
    Boolean(providerId) &&
    modelStrings.length > 0 &&
    // An alias is only typed by hand when there is exactly one model; for a
    // multi-select each alias is derived from its model name.
    (!isSingle || Boolean(alias)) &&
    hasCapability &&
    !saving;

  const sharedFields = () => ({
    provider_id: providerId as number,
    ...capabilities,
    ...limits,
    budget_duration: budgetDuration || null,
    is_active: isActive,
  });

  const handleSave = async () => {
    if (!canSave || !providerId) return;
    setSaving(true);
    try {
      if (isEdit && model?.id) {
        await updateModel(model.id, {
          ...sharedFields(),
          alias,
          model_string: modelStrings[0],
        });
        addSuccessToast(t('Model updated'));
      } else {
        // Created sequentially rather than in parallel: the alias uniqueness
        // and provider checks run per request, and a partial failure is much
        // easier to reason about when the order is deterministic.
        const created: string[] = [];
        for (const candidate of modelStrings) {
          // eslint-disable-next-line no-await-in-loop
          await createModel({
            ...sharedFields(),
            alias: isSingle ? alias : deriveAlias(candidate),
            model_string: candidate,
          });
          created.push(candidate);
        }
        addSuccessToast(
          created.length === 1
            ? t('Model created')
            : t('%s models created', created.length),
        );
      }
      onSaved();
      onHide();
    } catch (error) {
      addDangerToast(
        await describeApiError(
          error,
          isEdit
            ? t('Could not update the model. %s', CHECK_LOGS_HINT)
            : t('Could not create the model. %s', CHECK_LOGS_HINT),
        ),
      );
      // Some of a multi-select may already have been created, so refresh the
      // list even on failure rather than leaving the page showing stale state.
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      title={isEdit ? t('Edit model') : t('Add model')}
      footer={
        <Space>
          <Button onClick={onHide}>{t('Cancel')}</Button>
          <Button
            buttonStyle="primary"
            disabled={!canSave}
            onClick={handleSave}
          >
            {t('Save')}
          </Button>
        </Space>
      }
    >
      <Form layout="vertical">
        <Form.Item label={t('Provider')} required>
          <Select
            value={providerId ?? undefined}
            onChange={value => setProviderId(value as number)}
            options={providers.map(provider => ({
              value: provider.id,
              label: provider.name,
            }))}
            placeholder={t('Select a provider')}
          />
        </Form.Item>

        <Form.Item
          label={isEdit ? t('Model') : t('Models')}
          required
          extra={
            catalogueLoading
              ? t('Loading models from the provider...')
              : undefined
          }
        >
          {isEdit || !catalogue.length ? (
            // Editing targets exactly one deployment, and a provider with no
            // catalogue cannot offer a list, so both fall back to free text.
            <AutoComplete
              value={modelStrings[0] ?? ''}
              onChange={value =>
                setModelStrings(value ? [value as string] : [])
              }
              options={catalogue.map(id => ({ value: id }))}
              filterOption={(input, option) =>
                String(option?.value ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              placeholder={
                catalogue.length
                  ? t('Search or type a model name')
                  : t('e.g. %s', `${spec?.model_prefix ?? ''}model-name`)
              }
            />
          ) : (
            <Select
              mode="multiple"
              value={modelStrings}
              onChange={value => setModelStrings(value as string[])}
              options={catalogue.map(id => ({ value: id, label: id }))}
              placeholder={t('Select one or more models')}
              allowClear
            />
          )}
          <HelpText>
            {isEdit || !catalogue.length
              ? spec?.model_prefix
                ? t(
                    'The %s prefix is added automatically if you leave it off.',
                    spec.model_prefix,
                  )
                : t('Enter the full LiteLLM model string.')
              : t(
                  'Fetched from the provider. Pick as many as you want: each ' +
                    'becomes its own model, sharing the settings below.',
                )}
          </HelpText>
        </Form.Item>

        <Form.Item label={t('Alias')} required={isSingle}>
          {isSingle ? (
            <Input
              value={alias}
              onChange={event => setAlias(event.target.value)}
              placeholder={t('e.g. default-chat')}
            />
          ) : (
            // With several models selected a single alias would silently pool
            // them all behind one name, so show the derived aliases instead of
            // letting the operator discover that later.
            <Space direction="vertical" size={0}>
              {modelStrings.map(candidate => (
                <Typography.Text key={candidate} code>
                  {deriveAlias(candidate)}
                </Typography.Text>
              ))}
            </Space>
          )}
          <HelpText>
            {isSingle
              ? t(
                  'The name Zobi refers to this model by. Give two models the ' +
                    'same alias to load balance between them.',
                )
              : t(
                  'One alias per model, derived from its name. Edit any of ' +
                    'them afterwards, or reuse an alias to load balance.',
                )}
          </HelpText>
        </Form.Item>

        <Form.Item label={t('Capabilities')} required>
          <Space direction="vertical">
            {CAPABILITIES.map(({ field, label, hint }) => (
              <Checkbox
                key={field}
                checked={Boolean(capabilities[field as string])}
                onChange={event =>
                  setCapabilities(current => ({
                    ...current,
                    [field]: event.target.checked,
                  }))
                }
              >
                {label}{' '}
                <Typography.Text type="secondary">{hint}</Typography.Text>
              </Checkbox>
            ))}
          </Space>
          {!hasCapability && (
            <HelpText>
              {t('Select at least one, or this model can never be used.')}
            </HelpText>
          )}
        </Form.Item>

        <Form.Item label={t('Active')}>
          <Switch checked={isActive} onChange={setIsActive} />
        </Form.Item>

        <Collapse
          ghost
          items={[
            {
              key: 'limits',
              label: t('Rate limits and budget'),
              children: (
                <>
                  <HelpText>
                    {t(
                      'Leave blank for no limit. These apply per deployment, ' +
                        'so each model in a load-balanced pool has its own.',
                    )}
                  </HelpText>
                  <LimitsGrid>
                    <Form.Item label={t('Tokens per minute')}>
                      <InputNumber
                        min={1}
                        value={limits.tpm}
                        onChange={value =>
                          setLimits(c => ({ ...c, tpm: value as number }))
                        }
                      />
                    </Form.Item>
                    <Form.Item label={t('Requests per minute')}>
                      <InputNumber
                        min={1}
                        value={limits.rpm}
                        onChange={value =>
                          setLimits(c => ({ ...c, rpm: value as number }))
                        }
                      />
                    </Form.Item>
                    <Form.Item label={t('Max parallel requests')}>
                      <InputNumber
                        min={1}
                        value={limits.max_parallel_requests}
                        onChange={value =>
                          setLimits(c => ({
                            ...c,
                            max_parallel_requests: value as number,
                          }))
                        }
                      />
                    </Form.Item>
                    <Form.Item label={t('Max budget')}>
                      <InputNumber
                        min={0}
                        value={limits.max_budget}
                        onChange={value =>
                          setLimits(c => ({
                            ...c,
                            max_budget: value as number,
                          }))
                        }
                      />
                    </Form.Item>
                    <Form.Item label={t('Budget resets every')}>
                      <Input
                        value={budgetDuration}
                        onChange={event =>
                          setBudgetDuration(event.target.value)
                        }
                        placeholder={t('e.g. 30d')}
                      />
                    </Form.Item>
                  </LimitsGrid>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default withToasts(ModelModal);
