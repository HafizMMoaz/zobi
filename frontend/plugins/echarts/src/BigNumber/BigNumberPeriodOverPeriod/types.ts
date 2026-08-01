import {
  QueryFormData,
  TimeseriesDataRecord,
  Metric,
  SimpleAdhocFilter,
} from '@zobi.dev/core';

export type FontSizeOptions = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

export interface PopKPIStylesProps {
  height: number;
  width: number;
  headerFontSize: FontSizeOptions;
  subheaderFontSize: FontSizeOptions;
  boldText: boolean;
  comparisonColorEnabled: boolean;
}

export type TableColumnConfig = {
  visible?: boolean;
  customColumnName?: string;
  displayTypeIcon?: boolean;
};

interface PopKPICustomizeProps {
  headerText: string;
}

export interface PopKPIComparisonValueStyleProps {
  subheaderFontSize?: FontSizeOptions;
}

export interface PopKPIComparisonSymbolStyleProps {
  backgroundColor: string;
  textColor: string;
}

export type PopKPIQueryFormData = QueryFormData &
  PopKPIStylesProps &
  PopKPICustomizeProps;

export type PopKPIProps = PopKPIStylesProps &
  PopKPICustomizeProps & {
    data: TimeseriesDataRecord[];
    metrics: Metric[];
    metricName: string;
    metricNameFontSize?: number;
    showMetricName: boolean;
    bigNumber: string;
    prevNumber: string;
    subtitle?: string;
    subtitleFontSize: number;
    valueDifference: string;
    percentDifferenceFormattedString: string;
    compType: string;
    percentDifferenceNumber: number;
    comparisonColorScheme?: string;
    currentTimeRangeFilter?: SimpleAdhocFilter;
    startDateOffset?: string;
    shift: string;
    dashboardTimeRange?: string;
    columnConfig?: Record<string, TableColumnConfig>;
  };
