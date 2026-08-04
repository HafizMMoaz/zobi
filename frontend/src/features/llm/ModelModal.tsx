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
  const [modelString, setModelString] = useState('');
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
      setModelString(model.model_string);
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
      setModelString('');
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
      return;
    }
    fetchProviderModels(providerId)
      .then(setCatalogue)
      .catch(() => setCatalogue([]));
  }, [show, providerId, spec]);

  const hasCapability = Object.values(capabilities).some(Boolean);
  const canSave =
    Boolean(providerId) &&
    Boolean(alias) &&
    Boolean(modelString) &&
    hasCapability &&
    !saving;

  const handleSave = async () => {
    if (!canSave || !providerId) return;
    setSaving(true);
    const payload: Partial<LLMModelObject> = {
      provider_id: providerId,
      alias,
      model_string: modelString,
      ...capabilities,
      ...limits,
      budget_duration: budgetDuration || null,
      is_active: isActive,
    };
    try {
      if (isEdit && model?.id) {
        await updateModel(model.id, payload);
        addSuccessToast(t('Model updated'));
      } else {
        await createModel(payload);
        addSuccessToast(t('Model created'));
      }
      onSaved();
      onHide();
    } catch {
      addDangerToast(
        isEdit
          ? t('There was an issue updating the model.')
          : t('There was an issue creating the model.'),
      );
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

        <Form.Item label={t('Model')} required>
          {catalogue.length ? (
            <AutoComplete
              value={modelString}
              onChange={value => setModelString(value as string)}
              options={catalogue.map(id => ({ value: id }))}
              filterOption={(input, option) =>
                String(option?.value ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              placeholder={t('Search or type a model name')}
            />
          ) : (
            <Input
              value={modelString}
              onChange={event => setModelString(event.target.value)}
              placeholder={t(
                'e.g. %s',
                `${spec?.model_prefix ?? ''}model-name`,
              )}
            />
          )}
          <HelpText>
            {spec?.model_prefix
              ? t(
                  'The %s prefix is added automatically if you leave it off.',
                  spec.model_prefix,
                )
              : t('Enter the full LiteLLM model string.')}
          </HelpText>
        </Form.Item>

        <Form.Item label={t('Alias')} required>
          <Input
            value={alias}
            onChange={event => setAlias(event.target.value)}
            placeholder={t('e.g. default-chat')}
          />
          <HelpText>
            {t(
              'The name Zobi refers to this model by. Give two models the same ' +
                'alias to load balance between them.',
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
