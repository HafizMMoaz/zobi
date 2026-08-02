import DebouncedMessageQueue from './DebouncedMessageQueue';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('DebouncedMessageQueue', () => {
  test('should create a queue with default options', () => {
    const queue = new DebouncedMessageQueue();
    expect(queue).toBeDefined();
    expect(queue.trigger).toBeInstanceOf(Function);
  });

  test('should accept custom configuration options', () => {
    const mockCallback = jest.fn();
    const queue = new DebouncedMessageQueue({
      callback: mockCallback,
      sizeThreshold: 500,
      delayThreshold: 2000,
    });
    expect(queue).toBeDefined();
  });

  test('should append items to the queue', () => {
    const mockCallback = jest.fn();
    const queue = new DebouncedMessageQueue({ callback: mockCallback });

    const testEvent = { id: 1, message: 'test' };
    queue.append(testEvent);

    // Verify the append method doesn't throw
    expect(() => queue.append(testEvent)).not.toThrow();
  });

  test('should handle generic types properly', () => {
    interface TestEvent {
      id: number;
      data: string;
    }

    const mockCallback = jest.fn();
    const queue = new DebouncedMessageQueue<TestEvent>({
      callback: mockCallback,
    });

    const testEvent: TestEvent = { id: 1, data: 'test' };
    queue.append(testEvent);

    expect(() => queue.append(testEvent)).not.toThrow();
  });
});
