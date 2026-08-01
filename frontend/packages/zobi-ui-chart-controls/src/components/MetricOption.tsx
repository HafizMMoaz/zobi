import { useState, ReactNode, useLayoutEffect, RefObject } from 'react';

import { Metric } from '@zobi-ui/core';
import { css, styled, ZobiTheme } from '@zobi/core/theme';
import {
  SafeMarkdown,
  Typography,
  // TODO: somehow doesn't work with our main Tooltip (?)
  RawAntdTooltip as Tooltip,
  InfoTooltip,
} from '@zobi-ui/core/components';
import { ColumnTypeLabel } from './ColumnTypeLabel/ColumnTypeLabel';
import CertifiedIconWithTooltip from './CertifiedIconWithTooltip';
import { getMetricTooltipNode } from './labelUtils';
import { SQLPopover } from './SQLPopover';

const FlexRowContainer = styled.div`
  align-items: center;
  display: flex;

  > svg {
    margin-right: ${({ theme }) => theme.sizeUnit}px;
  }
`;

export interface MetricOptionProps {
  metric: Omit<Metric, 'id' | 'uuid'> & { label?: string };
  openInNewWindow?: boolean;
  showFormula?: boolean;
  showType?: boolean;
  url?: string;
  labelRef?: RefObject<any>;
  shouldShowTooltip?: boolean;
}

export function MetricOption({
  metric,
  labelRef,
  openInNewWindow = false,
  showFormula = true,
  showType = false,
  shouldShowTooltip = true,
  url = '',
}: MetricOptionProps) {
  const verbose = metric.verbose_name || metric.metric_name || metric.label;

  const label = (
    <span
      className="option-label metric-option-label"
      css={(theme: ZobiTheme) => css`
        margin-right: ${theme.sizeUnit}px;
      `}
      ref={labelRef}
    >
      {url ? (
        <Typography.Link
          href={url}
          target={openInNewWindow ? '_blank' : ''}
          rel="noreferrer"
        >
          {verbose}
        </Typography.Link>
      ) : (
        verbose
      )}
    </span>
  );

  const warningMarkdown =
    metric.warning_markdown || metric.warning_text || metric.error_text;

  const [tooltipText, setTooltipText] = useState<ReactNode>(metric.metric_name);

  useLayoutEffect(() => {
    setTooltipText(getMetricTooltipNode(metric, labelRef));
  }, [labelRef, metric]);

  return (
    <FlexRowContainer className="metric-option">
      {showType && <ColumnTypeLabel type="metric" />}
      {shouldShowTooltip ? (
        <Tooltip id="metric-name-tooltip" title={tooltipText}>
          {label}
        </Tooltip>
      ) : (
        label
      )}
      {showFormula && metric.expression && (
        <SQLPopover sqlExpression={metric.expression} />
      )}
      {metric.is_certified && (
        <CertifiedIconWithTooltip
          metricName={metric.metric_name}
          certifiedBy={metric.certified_by}
          details={metric.certification_details}
        />
      )}
      {warningMarkdown && (
        <InfoTooltip
          type="warning"
          tooltip={<SafeMarkdown source={warningMarkdown} />}
          label={`warn-${metric.metric_name}`}
          iconStyle={{ marginLeft: 0 }}
          {...(metric.error_text && {
            type: 'error',
          })}
        />
      )}
    </FlexRowContainer>
  );
}
