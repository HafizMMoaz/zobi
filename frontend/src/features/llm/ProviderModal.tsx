import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled, css } from '@zobi.dev/extension-api/theme';
import { Alert } from '@zobi.dev/extension-api/components';
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Switch,
} from '@zobi.dev/core/components';
import { Typography } from '@zobi.dev/core/components/Typography';
import withToasts from 'src/components/MessageToasts/withToasts';
import { createProvider, testProviderConnection, updateProvider } from './api';
import { CHECK_LOGS_HINT, describeApiError } from './errors';
import { LLMProviderObject, ProviderSpec } from './types';

const ProviderGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: ${theme.sizeUnit * 2}px;
    margin-bottom: ${theme.sizeUnit * 4}px;
  `}
`;

const ProviderCard = styled.button<{ selected: boolean }>`
  ${({ theme, selected }) => css`
    text-align: left;
    cursor: pointer;
    padding: ${theme.sizeUnit * 3}px;
    border-radius: ${theme.borderRadius}px;
    border: 1px solid ${selected ? theme.colorPrimary : theme.colorBorder};
    background: ${selected ? theme.colorPrimaryBg : theme.colorBgContainer};

    &:hover {
      border-color: ${theme.colorPrimary};
    }

    .provider-label {
      font-weight: ${theme.fontWeightStrong};
      display: block;
    }

    .provider-description {
      color: ${theme.colorTextSecondary};
      font-size: ${theme.fontSizeSM}px;
    }
  `}
`;

const TestSection = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.sizeUnit * 4}px;
    padding-top: ${theme.sizeUnit * 4}px;
    border-top: 1px solid ${theme.colorBorderSecondary};
  `}
`;

interface ProviderModalProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  specs: ProviderSpec[];
  provider?: LLMProviderObject | null;
  show: boolean;
  onHide: () => void;
  onSaved: () => void;
}

const ProviderModal: FunctionComponent<ProviderModalProps> = ({
  addDangerToast,
  addSuccessToast,
  specs,
  provider,
  show,
  onHide,
  onSaved,
}) => {
  const isEdit = Boolean(provider?.id);

  const [providerKey, setProviderKey] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [params, setParams] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [testModel, setTestModel] = useState('');
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testPassed, setTestPassed] = useState(false);

  const spec = useMemo(
    () => specs.find(candidate => candidate.key === providerKey),
    [specs, providerKey],
  );

  useEffect(() => {
    if (!show) return;
    if (provider) {
      setProviderKey(provider.provider_key);
      setName(provider.name);
      setIsActive(provider.is_active ?? true);
      // Masked secrets arrive as the sentinel and are sent back unchanged
      // unless the admin types over them.
      setParams({ ...provider.public_params });
    } else {
      setProviderKey('');
      setName('');
      setIsActive(true);
      setParams({});
    }
    setTestModel('');
    setTestError(null);
    setTestPassed(false);
  }, [show, provider]);

  const setParam = (key: string, value: string) => {
    setParams(current => ({ ...current, [key]: value }));
    // Any credential edit invalidates a previous pass.
    setTestPassed(false);
    setTestError(null);
  };

  const missingRequired = useMemo(() => {
    if (!spec) return true;
    return spec.fields
      .filter(field => field.required)
      .some(field => !params[field.name]);
  }, [spec, params]);

  const handleTest = async () => {
    if (!spec || !testModel) return;
    setTesting(true);
    setTestError(null);
    try {
      const outcome = await testProviderConnection({
        provider_key: spec.key,
        params,
        model_string: testModel,
        provider_id: provider?.id ?? null,
      });
      setTestPassed(outcome.result);
      setTestError(
        outcome.result ? null : (outcome.error ?? t('Unknown error')),
      );
    } catch {
      setTestPassed(false);
      setTestError(t('Could not reach the server to run the test.'));
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!spec || !name) return;
    setSaving(true);
    try {
      if (isEdit && provider?.id) {
        await updateProvider(provider.id, {
          name,
          params,
          is_active: isActive,
        });
        addSuccessToast(t('Provider updated'));
      } else {
        await createProvider({
          name,
          provider_key: spec.key,
          params,
          is_active: isActive,
        });
        addSuccessToast(t('Provider created'));
      }
      onSaved();
      onHide();
    } catch (error) {
      // Surface what the server actually said. A fixed string here once hid a
      // 500 from an encrypted-column type mismatch, which could only be found
      // in the container logs.
      addDangerToast(
        await describeApiError(
          error,
          isEdit
            ? t('Could not update the provider. %s', CHECK_LOGS_HINT)
            : t('Could not create the provider. %s', CHECK_LOGS_HINT),
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: ProviderSpec['fields'][number]) => {
    const value = params[field.name] ?? field.default ?? '';
    const common = {
      value,
      placeholder: field.placeholder,
      onChange: (event: { target: { value: string } }) =>
        setParam(field.name, event.target.value),
    };
    return (
      <Form.Item
        key={field.name}
        label={field.label}
        required={field.required}
        help={field.help_text || undefined}
      >
        {field.type === 'textarea' ? (
          <Input.TextArea {...common} rows={5} />
        ) : field.type === 'password' ? (
          <Input.Password {...common} autoComplete="new-password" />
        ) : (
          <Input {...common} />
        )}
      </Form.Item>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      title={isEdit ? t('Edit provider') : t('Add provider')}
      footer={
        <Space>
          <Button onClick={onHide}>{t('Cancel')}</Button>
          <Button
            buttonStyle="primary"
            disabled={!spec || !name || missingRequired || saving}
            onClick={handleSave}
          >
            {t('Save')}
          </Button>
        </Space>
      }
    >
      {!isEdit && (
        <ProviderGrid>
          {specs.map(candidate => (
            <ProviderCard
              key={candidate.key}
              type="button"
              selected={candidate.key === providerKey}
              onClick={() => {
                setProviderKey(candidate.key);
                setParams({});
                setTestPassed(false);
                setTestError(null);
              }}
            >
              <span className="provider-label">{candidate.label}</span>
              <span className="provider-description">
                {candidate.description}
              </span>
            </ProviderCard>
          ))}
        </ProviderGrid>
      )}

      {spec && (
        <Form layout="vertical">
          <Form.Item label={t('Display name')} required>
            <Input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder={t('e.g. OpenRouter (production)')}
            />
          </Form.Item>

          {spec.fields.map(renderField)}

          <Form.Item label={t('Active')}>
            <Switch checked={isActive} onChange={setIsActive} />
          </Form.Item>

          <TestSection>
            <Typography.Text strong>{t('Test connection')}</Typography.Text>
            <Typography.Paragraph type="secondary">
              {t(
                'Runs one minimal completion to confirm the credentials work. ' +
                  'Enter any model this account can reach.',
              )}
            </Typography.Paragraph>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={testModel}
                onChange={event => setTestModel(event.target.value)}
                placeholder={
                  spec.model_prefix
                    ? t('Model, e.g. %s', `${spec.model_prefix}...`)
                    : t('Full LiteLLM model string')
                }
              />
              <Button
                onClick={handleTest}
                loading={testing}
                disabled={!testModel || missingRequired}
              >
                {t('Test')}
              </Button>
            </Space.Compact>

            {testPassed && (
              <Alert
                type="success"
                showIcon
                message={t('Connection verified')}
                css={theme => ({ marginTop: theme.sizeUnit * 2 })}
              />
            )}
            {testError && (
              <Alert
                type="error"
                showIcon
                message={t('Test failed')}
                description={testError}
                css={theme => ({ marginTop: theme.sizeUnit * 2 })}
              />
            )}
          </TestSection>
        </Form>
      )}
    </Modal>
  );
};

export default withToasts(ProviderModal);
