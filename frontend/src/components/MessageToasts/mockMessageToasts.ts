import { ToastType, ToastMeta } from 'src/components/MessageToasts/types';

const mockMessageToasts: Partial<ToastMeta>[] = [
  { id: 'info_id', toastType: ToastType.Info, text: 'info toast' },
  { id: 'danger_id', toastType: ToastType.Danger, text: 'danger toast' },
];

export default mockMessageToasts;
