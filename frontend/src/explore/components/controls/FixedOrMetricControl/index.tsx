import { Component } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { Collapse, Label } from '@zobi.dev/core/components';
import TextControl from 'src/explore/components/controls/TextControl';
import MetricsControl from 'src/explore/components/controls/MetricControl/MetricsControl';
import ControlHeader from 'src/explore/components/ControlHeader';
import PopoverSection from '@zobi.dev/core/components/PopoverSection';

const controlTypes = {
  fixed: 'fix',
  metric: 'metric',
} as const;

interface ControlValue {
  type?: 'fix' | 'metric';
  value?:
    | string
    | number
    | { label?: string; expressionType?: string; sqlExpression?: string };
}

interface MetricValue {
  label?: string;
  expressionType?: string;
  sqlExpression?: string;
  [key: string]: unknown;
}

interface DatasourceType {
  columns?: { column_name: string }[];
  metrics?: { metric_name: string; expression: string }[];
  [key: string]: unknown;
}

interface FixedOrMetricControlProps {
  onChange?: (value: ControlValue) => void;
  value?: ControlValue;
  isFloat?: boolean;
  datasource: DatasourceType;
  default?: ControlValue;
}

interface FixedOrMetricControlState {
  type: 'fix' | 'metric';
  fixedValue: string | number;
  metricValue: MetricValue | null;
}

const defaultProps = {
  onChange: () => {},
  default: { type: controlTypes.fixed, value: 5 },
};

export default class FixedOrMetricControl extends Component<
  FixedOrMetricControlProps,
  FixedOrMetricControlState
> {
  constructor(props: FixedOrMetricControlProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.setType = this.setType.bind(this);
    this.setFixedValue = this.setFixedValue.bind(this);
    this.setMetric = this.setMetric.bind(this);
    const type = (props.value?.type ??
      props.default?.type ??
      controlTypes.fixed) as 'fix' | 'metric';
    const rawValue = props.value?.value ?? props.default?.value ?? '100';
    const fixedValue =
      type === controlTypes.fixed && typeof rawValue !== 'object'
        ? rawValue
        : '';
    const metricValue =
      type === controlTypes.metric && typeof rawValue === 'object'
        ? (rawValue as MetricValue)
        : null;
    this.state = {
      type,
      fixedValue,
      metricValue,
    };
  }

  onChange(): void {
    this.props.onChange?.({
      type: this.state.type,
      value:
        this.state.type === controlTypes.fixed
          ? this.state.fixedValue
          : (this.state.metricValue ?? undefined),
    });
  }

  setType(type: 'fix' | 'metric'): void {
    this.setState({ type }, this.onChange);
  }

  setFixedValue(fixedValue: string | number): void {
    this.setState({ fixedValue }, this.onChange);
  }

  setMetric(metricValue: MetricValue | null): void {
    this.setState({ metricValue }, this.onChange);
  }

  render() {
    const value = this.props.value ?? this.props.default;
    const type = value?.type ?? controlTypes.fixed;
    const columns = this.props.datasource
      ? this.props.datasource.columns
      : null;
    const metrics = this.props.datasource
      ? this.props.datasource.metrics
      : null;
    return (
      <div>
        <ControlHeader {...this.props} />
        <Collapse
          ghost
          items={[
            {
              key: 'fixed-or-metric',
              showArrow: false,
              label: (
                <Label>
                  {this.state.type === controlTypes.fixed && (
                    <span>{this.state.fixedValue}</span>
                  )}
                  {this.state.type === controlTypes.metric && (
                    <span>
                      <span>{t('metric')}: </span>
                      <strong>
                        {this.state.metricValue
                          ? this.state.metricValue.label
                          : null}
                      </strong>
                    </span>
                  )}
                </Label>
              ),
              children: (
                <div className="well">
                  <PopoverSection
                    title={t('Fixed')}
                    isSelected={type === controlTypes.fixed}
                    onSelect={() => {
                      this.setType(controlTypes.fixed);
                    }}
                  >
                    <TextControl
                      isFloat
                      onChange={this.setFixedValue}
                      onFocus={() => {
                        this.setType(controlTypes.fixed);
                        return {};
                      }}
                      value={this.state.fixedValue}
                    />
                  </PopoverSection>
                  <PopoverSection
                    title={t('Based on a metric')}
                    isSelected={type === controlTypes.metric}
                    onSelect={() => {
                      this.setType(controlTypes.metric);
                    }}
                  >
                    <MetricsControl
                      name="metric"
                      columns={columns ?? undefined}
                      savedMetrics={metrics ?? undefined}
                      multi={false}
                      onFocus={() => {
                        this.setType(controlTypes.metric);
                      }}
                      onChange={this.setMetric}
                      value={this.state.metricValue}
                      datasource={this.props.datasource}
                    />
                  </PopoverSection>
                </div>
              ),
            },
          ]}
        />
      </div>
    );
  }
}

// @ts-expect-error - defaultProps for backward compatibility
FixedOrMetricControl.defaultProps = defaultProps;
