import { debounce } from 'lodash';

export interface DebouncedMessageQueueOptions<T> {
  callback?: (events: T[]) => void;
  sizeThreshold?: number;
  delayThreshold?: number;
}

class DebouncedMessageQueue<T = Record<string, unknown>> {
  private queue: T[];

  private readonly sizeThreshold: number;

  private readonly delayThreshold: number;

  private readonly callback: (events: T[]) => void;

  public readonly trigger: () => void;

  constructor({
    callback = () => {},
    sizeThreshold = 1000,
    delayThreshold = 1000,
  }: DebouncedMessageQueueOptions<T> = {}) {
    this.queue = [];
    this.sizeThreshold = sizeThreshold;
    this.delayThreshold = delayThreshold;
    this.callback = callback;

    this.trigger = debounce(
      this.triggerInternal.bind(this),
      this.delayThreshold,
    );
  }

  append(eventData: T): void {
    this.queue.push(eventData);
    this.trigger();
  }

  private triggerInternal(): void {
    if (this.queue.length > 0) {
      const events = this.queue.splice(0, this.sizeThreshold);
      this.callback.call(null, events);

      // If there are remaining items, call it again.
      if (this.queue.length > 0) {
        this.trigger();
      }
    }
  }
}

export default DebouncedMessageQueue;
