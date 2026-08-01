export enum ToastType {
  Info = 'INFO_TOAST',
  Success = 'SUCCESS_TOAST',
  Warning = 'WARNING_TOAST',
  Danger = 'DANGER_TOAST',
}

export interface ToastMeta {
  id: string;
  toastType: ToastType;
  text: string;
  duration: number;
  /** Whether to skip displaying this message if there are another toast
   * with the same message. */
  noDuplicate?: boolean;
  /** For security reasons, HTML rendering is disabled by default. Use this property to enable it. */
  allowHtml?: boolean;
}
