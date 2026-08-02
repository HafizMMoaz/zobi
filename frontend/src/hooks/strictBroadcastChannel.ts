// Credit to Eric Wong at https://stackoverflow.com/a/78491331
interface StrictBroadcastChannelEventMap<T> {
  message: MessageEvent<T>;
  messageerror: MessageEvent<T>;
}

export interface StrictBroadcastChannel<T> extends EventTarget {
  readonly name: string;
  onmessage: ((this: BroadcastChannel, ev: MessageEvent<T>) => any) | null;
  onmessageerror: ((this: BroadcastChannel, ev: MessageEvent<T>) => any) | null;
  close(): void;
  postMessage(message: T): void;
  addEventListener<K extends keyof StrictBroadcastChannelEventMap<T>>(
    type: K,
    listener: (
      this: BroadcastChannel,
      ev: StrictBroadcastChannelEventMap<T>[K],
    ) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof StrictBroadcastChannelEventMap<T>>(
    type: K,
    listener: (
      this: BroadcastChannel,
      ev: StrictBroadcastChannelEventMap<T>[K],
    ) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

export interface TabIdChannelMessage {
  type: 'REQUESTING_TAB_ID' | 'TAB_ID_DENIED';
  tabId: string;
}
