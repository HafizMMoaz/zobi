import { FunctionComponent, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { Popover } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import { AgentMode, ChatModel, ModeOption } from './types';

const Trigger = styled.button`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    gap: ${theme.sizeUnit}px;
    border: 1px solid ${theme.colorBorder};
    border-radius: ${theme.borderRadius}px;
    background: transparent;
    color: ${theme.colorText};
    padding: 0 ${theme.sizeUnit * 3}px;
    height: ${theme.controlHeight}px;
    max-width: 200px;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: ${theme.colorBgTextHover};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `}
`;

const TriggerLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Menu = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.sizeUnit * 3}px;
    min-width: 220px;
    max-height: 320px;
    overflow-y: auto;
  `}
`;

const SectionLabel = styled.div`
  ${({ theme }) => css`
    font-size: ${theme.fontSizeXS}px;
    color: ${theme.colorTextTertiary};
    padding: 0 ${theme.sizeUnit * 3}px ${theme.sizeUnit}px;
    text-transform: uppercase;
  `}
`;

const Row = styled.button<{ active: boolean }>`
  ${({ theme, active }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border: 0;
    text-align: left;
    padding: ${theme.sizeUnit * 2}px ${theme.sizeUnit * 3}px;
    background: ${active ? theme.colorBgTextHover : 'transparent'};
    cursor: pointer;
    border-radius: ${theme.borderRadius}px;

    &:hover {
      background: ${theme.colorBgTextHover};
    }
  `}
`;

const modelLabel = (model: ChatModel) =>
  model.is_default ? t('%s (default)', model.alias) : model.alias;

export type ComposerSwitcherProps = {
  modes: ModeOption[];
  mode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  models: ChatModel[];
  threadModel: string | null;
  onThreadModelChange: (alias: string | null) => void;
  onceModel: string | null;
  onOnceModelChange: (alias: string | null) => void;
  disabled?: boolean;
};

/**
 * One trigger consolidating mode, thread-default model, and per-message
 * model override, in the style of a model switcher: click, pick, closed.
 *
 * Renders even with no models configured - the mode section always has
 * something to switch - but the two model sections disappear together when
 * the gateway has none.
 */
const ComposerSwitcher: FunctionComponent<ComposerSwitcherProps> = ({
  modes,
  mode,
  onModeChange,
  models,
  threadModel,
  onThreadModelChange,
  onceModel,
  onOnceModelChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const currentModeLabel =
    modes.find(option => option.value === mode)?.label ?? mode;
  const triggerLabel = models.length
    ? (onceModel ?? threadModel ?? t('Default'))
    : currentModeLabel;

  const pick = (apply: () => void) => () => {
    apply();
    setOpen(false);
  };

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="topLeft"
      content={
        <Menu role="menu" aria-label={t('Switch mode and model')}>
          <div role="group" aria-label={t('Mode')}>
            <SectionLabel>{t('Mode')}</SectionLabel>
            {modes.map(option => (
              <Row
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={option.value === mode}
                active={option.value === mode}
                onClick={pick(() => onModeChange(option.value))}
              >
                {option.label}
              </Row>
            ))}
          </div>
          {models.length > 0 && (
            <div role="group" aria-label={t('Model')}>
              <SectionLabel>{t('Model')}</SectionLabel>
              <Row
                type="button"
                role="menuitemradio"
                aria-checked={threadModel === null}
                active={threadModel === null}
                onClick={pick(() => onThreadModelChange(null))}
              >
                {t('Default')}
              </Row>
              {models.map(model => (
                <Row
                  key={model.alias}
                  type="button"
                  role="menuitemradio"
                  aria-checked={threadModel === model.alias}
                  active={threadModel === model.alias}
                  onClick={pick(() => onThreadModelChange(model.alias))}
                >
                  {modelLabel(model)}
                </Row>
              ))}
            </div>
          )}
          {models.length > 0 && (
            <div role="group" aria-label={t('This message only')}>
              <SectionLabel>{t('This message only')}</SectionLabel>
              <Row
                type="button"
                role="menuitemradio"
                aria-checked={onceModel === null}
                active={onceModel === null}
                onClick={pick(() => onOnceModelChange(null))}
              >
                {t('None')}
              </Row>
              {models.map(model => (
                <Row
                  key={model.alias}
                  type="button"
                  role="menuitemradio"
                  aria-checked={onceModel === model.alias}
                  active={onceModel === model.alias}
                  onClick={pick(() => onOnceModelChange(model.alias))}
                >
                  {modelLabel(model)}
                </Row>
              ))}
            </div>
          )}
        </Menu>
      }
    >
      <Trigger
        type="button"
        disabled={disabled}
        aria-label={t('Switch mode and model')}
      >
        <TriggerLabel>{triggerLabel}</TriggerLabel>
        <Icons.DownOutlined iconSize="s" />
      </Trigger>
    </Popover>
  );
};

export default ComposerSwitcher;
