import type { PendingAttachment } from '@assistant-ui/react';
import { createAttachmentAdapter } from './attachmentAdapter';
import * as api from '../api';

jest.mock('../api');

test('add() starts the upload and send() resolves once it completes', async () => {
  (api.uploadAttachment as jest.Mock).mockImplementation(
    (_id, _file, handlers) => {
      handlers.onDone({
        id: 5,
        uuid: 'u',
        filename: 'data.csv',
        kind: 'csv',
        status: 'ready',
        size_bytes: 100,
        summary: null,
        error: null,
      });
      return () => {};
    },
  );

  const ensureConversation = jest.fn().mockResolvedValue(1);
  const adapter = createAttachmentAdapter(ensureConversation);

  const file = new File(['a,b'], 'data.csv', { type: 'text/csv' });
  // `AttachmentAdapter.add`'s interface signature also allows an
  // AsyncGenerator return (for adapters that stream progress); this adapter
  // never does, so narrow back to the Promise form it actually returns.
  const pending = await (adapter.add({ file }) as Promise<PendingAttachment>);
  expect(pending.name).toBe('data.csv');

  const complete = await adapter.send(pending);
  expect(complete.status).toEqual({ type: 'complete' });
  expect(ensureConversation).toHaveBeenCalled();
});

test('remove() deletes the attachment on the server', async () => {
  const adapter = createAttachmentAdapter(jest.fn().mockResolvedValue(1));
  await adapter.remove!({
    id: 'a',
    type: 'document',
    name: 'data.csv',
    content: [],
    status: { type: 'complete' },
  } as any);
  expect(api.deleteAttachment).toHaveBeenCalled();
});
