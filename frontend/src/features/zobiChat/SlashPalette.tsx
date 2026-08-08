import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { Tag } from '@zobi.dev/core/components';
import { AgentToolSummary, ToolRisk } from './types';

const Panel = styled.div`
  ${({ theme }) => css`
    border: 1px solid ${theme.colorBorder};
    border-radius: ${theme.borderRadius}px;
    background: ${theme.colorBgElevated};
    max-height: 240px;
    overflow-y: auto;
    margin-bottom: ${theme.sizeUnit * 2}px;
  `}
`;

const Row = styled.button<{ active: boolean }>`
  ${({ theme, active }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.sizeUnit * 2}px;
    width: 100%;
    border: 0;
    text-align: left;
    padding: ${theme.sizeUnit * 2}px ${theme.sizeUnit * 3}px;
    background: ${active ? theme.colorBgTextHover : 'transparent'};
    cursor: pointer;

    &:hover {
      background: ${theme.colorBgTextHover};
    }
  `}
`;

const Empty = styled.div`
  ${({ theme }) => css`
    padding: ${theme.sizeUnit * 3}px;
    color: ${theme.colorTextTertiary};
  `}
`;

const RISK_COLOR: Partial<Record<ToolRisk, string>> = {
  write: 'orange',
  destructive: 'red',
};

export type SlashPaletteProps = {
  tools: AgentToolSummary[];
  query: string;
  open: boolean;
  onSelect: (tool: AgentToolSummary) => void;
  onDismiss: () => void;
};

/**
 * The "/" menu over the composer.
 *
 * Keyboard handling is a document listener rather than the textarea's own
 * onKeyDown so the textarea never loses focus: the user is still typing the
 * request while choosing which tool it is aimed at.
 */
const SlashPalette: FunctionComponent<SlashPaletteProps> = ({
  tools,
  query,
  open,
  onSelect,
  onDismiss,
}) => {
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tools;
    return tools.filter(
      tool =>
        tool.name.toLowerCase().includes(needle) ||
        tool.title.toLowerCase().includes(needle),
    );
  }, [tools, query]);

  // A new query starts the highlight back at the top.
  useEffect(() => setActive(0), [query]);

  // The tool list can shrink out from under an unchanged query, e.g. a mode
  // switch that narrows which tools are available. Clamp rather than reset
  // so the highlight keeps its position instead of jumping back to the top.
  useEffect(() => {
    setActive(current => Math.min(current, Math.max(matches.length - 1, 0)));
  }, [matches.length]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onDismiss();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive(current => Math.min(current + 1, matches.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive(current => Math.max(current - 1, 0));
      } else if (event.key === 'Enter' && matches[active]) {
        event.preventDefault();
        onSelect(matches[active]);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, matches, active, onSelect, onDismiss]);

  if (!open) return null;

  return (
    <Panel role="listbox" aria-label={t('Tools')}>
      {!matches.length && <Empty>{t('No matching tools')}</Empty>}
      {matches.map((tool, index) => (
        <Row
          key={tool.name}
          type="button"
          role="option"
          aria-selected={index === active}
          active={index === active}
          onMouseEnter={() => setActive(index)}
          onClick={() => onSelect(tool)}
        >
          <span>{tool.title}</span>
          {RISK_COLOR[tool.risk] && (
            <Tag color={RISK_COLOR[tool.risk]}>{tool.risk}</Tag>
          )}
        </Row>
      ))}
    </Panel>
  );
};

export default SlashPalette;
