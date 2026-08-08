import type {
  AttachmentAdapter,
  CompleteAttachment,
  PendingAttachment,
} from '@assistant-ui/react';
import { deleteAttachment, uploadAttachment } from '../api';
import { Attachment } from '../types';

type ZobiPendingAttachment = PendingAttachment & { serverAttachment: Attachment | null };

/**
 * Bridges assistant-ui's `AttachmentAdapter` to the existing upload API.
 *
 * `add()` runs the whole upload to completion before resolving (there is no
 * separate progress-reporting phase in the composer's lifecycle here), so
 * the resulting `PendingAttachment` is marked `requires-action`/`composer-send`
 * rather than `running`/`uploading` - the file has already landed, and it is
 * just waiting for the user to hit send. `send()` then only has to attach the
 * server id.
 */
export function createAttachmentAdapter(
  ensureConversation: () => Promise<number>,
): AttachmentAdapter {
  return {
    accept: '.csv,.sql,.pdf,image/*',

    async add({ file }): Promise<ZobiPendingAttachment> {
      const conversationId = await ensureConversation();
      const serverAttachment = await new Promise<Attachment>((resolve, reject) => {
        uploadAttachment(conversationId, file, {
          onDone: resolve,
          onError: reject,
        });
      });

      return {
        id: String(serverAttachment.id),
        type: serverAttachment.kind === 'image' ? 'image' : 'document',
        name: serverAttachment.filename,
        contentType: file.type,
        file,
        serverAttachment,
        status: { type: 'requires-action', reason: 'composer-send' },
      };
    },

    async send(attachment): Promise<CompleteAttachment> {
      const pending = attachment as ZobiPendingAttachment;
      return {
        ...pending,
        status: { type: 'complete' },
        content: [
          {
            type: 'text',
            text: `[attachment:${pending.serverAttachment?.id}] ${pending.name}`,
          },
        ],
      };
    },

    async remove(attachment) {
      await deleteAttachment(Number(attachment.id));
    },
  };
}
