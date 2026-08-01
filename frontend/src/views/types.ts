import { NotificationMethodOption } from 'src/features/alerts/types';

export interface ViewState {
  common: {
    conf: {
      SQLALCHEMY_DOCS_URL: string;
      SQLALCHEMY_DISPLAY_TEXT: string;
      ALERT_REPORTS_NOTIFICATION_METHODS: NotificationMethodOption[];
    };
    currencies: string[];
  };
  messageToast: Array<object>;
}
