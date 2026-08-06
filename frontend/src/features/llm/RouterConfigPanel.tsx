import { FunctionComponent, useEffect, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled, css } from '@zobi.dev/extension-api/theme';
import {
  Button,
  Collapse,
  Form,
  InputNumber,
  Select,
  Space,
} from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Typography } from '@zobi.dev/core/components/Typography';
import withToasts from 'src/components/MessageToasts/withToasts';
import { fetchRouterConfig, saveRouterConfig } from './api';
import { FallbackEntry, RouterConfig, ROUTING_STRATEGIES } from './types';

const Panel = styled.div`
  ${({ theme }) => css`
    background: ${theme.colorBgContainer};
    border: 1px solid ${theme.colorBorderSecondary};
    border-radius: ${theme.borderRadius}px;
    padding: ${theme.sizeUnit * 4}px;
    margin-bottom: ${theme.sizeUnit * 4}px;
  `}
`;

const DefaultsGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: ${theme.sizeUnit * 3}px;
  `}
`;

const FallbackRow = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.sizeUnit * 2}px;
    margin-bottom: ${theme.sizeUnit * 2}px;

    .fallback-primary {
      min-width: 180px;
    }

    .fallback-backups {
      flex: 1;
    }
  `}
`;

const STRATEGY_HINTS: Record<string, string> = {
  'simple-shuffle': t('Pick at random, weighted by rate limits'),
  'least-busy': t('Send to the deployment with fewest active calls'),
  'usage-based-routing': t('Send to the deployment with most headroom'),
  'latency-based-routing': t('Send to the deployment answering fastest'),
};

interface RouterConfigPanelProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  /** Every alias in use, deduped - what routing may point at. */
  aliases: string[];
}

const RouterConfigPanel: FunctionComponent<RouterConfigPanelProps> = ({
  addDangerToast,
  addSuccessToast,
  aliases,
}) => {
  const [config, setConfig] = useState<RouterConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRouterConfig()
      .then(setConfig)
      .catch(() => addDangerToast(t('Could not load routing settings.')));
  }, [addDangerToast]);

  if (!config) return null;

  const update = (patch: Partial<RouterConfig>) =>
    setConfig(current => (current ? { ...current, ...patch } : current));

  const updateFallback = (index: number, patch: Partial<FallbackEntry>) =>
    update({
      fallbacks: config.fallbacks.map((entry, i) =>
        i === index ? { ...entry, ...patch } : entry,
      ),
    });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Chains with no backups are meaningless and the API rejects them, so
      // drop half-built rows rather than surfacing a validation error.
      const saved = await saveRouterConfig({
        ...config,
        fallbacks: config.fallbacks.filter(
          entry => entry.primary && entry.backups.length,
        ),
      });
      setConfig(saved);
      addSuccessToast(t('Routing settings saved'));
    } catch {
      addDangerToast(
        t('Could not save routing settings. Check that every alias exists.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const aliasOptions = aliases.map(alias => ({ value: alias, label: alias }));

  return (
    <Panel>
      <Typography.Title level={5}>{t('Routing')}</Typography.Title>
      <Typography.Paragraph type="secondary">
        {t('Which model answers when a caller does not name one.')}
      </Typography.Paragraph>

      <DefaultsGrid>
        <Form.Item label={t('Default chat model')}>
          <Select
            allowClear
            value={config.default_chat_alias ?? undefined}
            options={aliasOptions}
            onChange={value =>
              update({ default_chat_alias: (value as string) ?? null })
            }
            placeholder={t('First available')}
          />
        </Form.Item>
        <Form.Item label={t('Default transcription model')}>
          <Select
            allowClear
            value={config.default_transcription_alias ?? undefined}
            options={aliasOptions}
            onChange={value =>
              update({ default_transcription_alias: (value as string) ?? null })
            }
            placeholder={t('First available')}
          />
        </Form.Item>
        <Form.Item label={t('Default embedding model')}>
          <Select
            allowClear
            value={config.default_embedding_alias ?? undefined}
            options={aliasOptions}
            onChange={value =>
              update({ default_embedding_alias: (value as string) ?? null })
            }
            placeholder={t('First available')}
          />
        </Form.Item>
      </DefaultsGrid>

      <Collapse
        ghost
        items={[
          {
            key: 'advanced',
            label: t('Advanced routing'),
            children: (
              <>
                <Form.Item
                  label={t('Load balancing strategy')}
                  help={STRATEGY_HINTS[config.routing_strategy]}
                >
                  <Select
                    value={config.routing_strategy}
                    options={ROUTING_STRATEGIES.map(strategy => ({
                      value: strategy,
                      label: strategy,
                    }))}
                    onChange={value =>
                      update({ routing_strategy: value as string })
                    }
                  />
                </Form.Item>

                <DefaultsGrid>
                  <Form.Item
                    label={t('Retries')}
                    help={t('Attempts before falling back')}
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      value={config.num_retries}
                      onChange={value =>
                        update({ num_retries: value as number })
                      }
                    />
                  </Form.Item>
                  <Form.Item label={t('Timeout (seconds)')}>
                    <InputNumber
                      min={1}
                      value={config.timeout}
                      onChange={value => update({ timeout: value as number })}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t('Cooldown (seconds)')}
                    help={t('How long a failing deployment is skipped')}
                  >
                    <InputNumber
                      min={0}
                      value={config.cooldown_time}
                      onChange={value =>
                        update({ cooldown_time: value as number })
                      }
                    />
                  </Form.Item>
                  <Form.Item label={t('Default max parallel requests')}>
                    <InputNumber
                      min={1}
                      value={config.default_max_parallel_requests}
                      onChange={value =>
                        update({
                          default_max_parallel_requests: value as number,
                        })
                      }
                    />
                  </Form.Item>
                </DefaultsGrid>

                <Typography.Text strong>{t('Fallbacks')}</Typography.Text>
                <Typography.Paragraph type="secondary">
                  {t(
                    'If the primary alias fails, try each backup in order. ' +
                      'An alias cannot fall back to itself.',
                  )}
                </Typography.Paragraph>

                {config.fallbacks.map((entry, index) => (
                  // Index keys are safe here: rows are only appended and
                  // removed as a whole, never reordered in place.
                  // eslint-disable-next-line react/no-array-index-key
                  <FallbackRow key={index}>
                    <Select
                      className="fallback-primary"
                      value={entry.primary || undefined}
                      options={aliasOptions}
                      placeholder={t('Primary')}
                      onChange={value =>
                        updateFallback(index, { primary: value as string })
                      }
                    />
                    <Select
                      className="fallback-backups"
                      mode="multiple"
                      value={entry.backups}
                      options={aliasOptions.filter(
                        option => option.value !== entry.primary,
                      )}
                      placeholder={t('Backups, in order')}
                      onChange={value =>
                        updateFallback(index, { backups: value as string[] })
                      }
                    />
                    <Button
                      buttonStyle="link"
                      onClick={() =>
                        update({
                          fallbacks: config.fallbacks.filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                    >
                      <Icons.DeleteOutlined />
                    </Button>
                  </FallbackRow>
                ))}

                <Button
                  buttonStyle="secondary"
                  disabled={!aliases.length}
                  onClick={() =>
                    update({
                      fallbacks: [
                        ...config.fallbacks,
                        { primary: '', backups: [] },
                      ],
                    })
                  }
                >
                  {t('Add fallback')}
                </Button>
              </>
            ),
          },
        ]}
      />

      <Space>
        <Button buttonStyle="primary" loading={saving} onClick={handleSave}>
          {t('Save routing')}
        </Button>
      </Space>
    </Panel>
  );
};

export default withToasts(RouterConfigPanel);
