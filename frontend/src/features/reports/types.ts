
/**
 * Types mirroring enums in `zobi/reports/models.py`:
 */
export type ReportScheduleType = 'Alert' | 'Report';
export type ReportCreationMethod = 'charts' | 'dashboards' | 'alerts_reports';

export type ReportRecipientType = 'Email' | 'Slack' | 'Webhook';

export enum ReportType {
  Dashboards = 'dashboards',
  Charts = 'charts',
}

export enum NotificationFormats {
  Text = 'TEXT',
  PNG = 'PNG',
  CSV = 'CSV',
}
export interface ReportObject {
  id?: number;
  active: boolean;
  crontab: string;
  dashboard?: number;
  chart?: number;
  description?: string;
  log_retention: number;
  name: string;
  owners: number[];
  recipients: [
    {
      recipient_config_json: {
        target: string;
        ccTarget: string;
        bccTarget: string;
      };
      type: ReportRecipientType;
    },
  ];
  report_format: string;
  timezone: string;
  type: ReportScheduleType;
  validator_config_json: {} | null;
  validator_type: string;
  working_timeout: number;
  creation_method: string;
  force_screenshot: boolean;
  custom_width?: number | null;
  error?: string;
}
