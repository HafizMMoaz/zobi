import {
  ChangeEvent,
  FC,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { Button } from '@zobi.dev/core/components';
import { Icons, IconType } from '@zobi.dev/core/components/Icons';
import { describeApiError } from '../llm/errors';
import { deleteAttachment, uploadAttachment } from './api';
import { Attachment, AttachmentItem, AttachmentKind } from './types';

/**
 * Largest file the composer will send.
 *
 * The check is client-side on purpose: a 400 MB video dropped by accident
 * would otherwise spend minutes uploading before the server rejected it, on a
 * connection the user still needs for the conversation itself.
 */
const MAX_FILE_BYTES = 25 * 1024 * 1024;

/** Keeps one message's context, and the composer, to a readable size. */
const MAX_FILES = 10;

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

/** Value for the file input's `accept`, mirroring what classify() allows. */
export const ACCEPTED_FILE_TYPES = [
  '.csv',
  '.sql',
  '.pdf',
  'text/csv',
  'application/sql',
  'application/pdf',
  ...Array.from(SUPPORTED_IMAGE_TYPES),
].join(',');

const KIND_ICON: Record<AttachmentKind, FC<IconType>> = {
  csv: Icons.TableOutlined,
  sql: Icons.ConsoleSqlOutlined,
  pdf: Icons.FileTextOutlined,
  image: Icons.FileImageOutlined,
  other: Icons.FileOutlined,
};

const List = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.sizeUnit}px;
  `}
`;

const Chip = styled.div<{ failed: boolean }>`
  ${({ theme, failed }) => css`
    display: flex;
    align-items: flex-start;
    gap: ${theme.sizeUnit * 2}px;
    padding: ${theme.sizeUnit}px ${theme.sizeUnit * 2}px;
    border: 1px solid
      ${failed ? theme.colorErrorBorder : theme.colorBorderSecondary};
    background: ${failed ? theme.colorErrorBg : theme.colorBgContainer};
    border-radius: ${theme.borderRadius}px;
    font-size: ${theme.fontSizeSM}px;
  `}
`;

const ChipBody = styled.div`
  ${({ theme }) => css`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: ${theme.sizeUnit / 2}px;
  `}
`;

const ChipTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.sizeUnit * 2}px;

    .filename {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: ${theme.fontWeightStrong};
    }

    .size {
      color: ${theme.colorTextTertiary};
      flex-shrink: 0;
    }
  `}
`;

const ChipDetail = styled.div<{ failed: boolean }>`
  ${({ theme, failed }) => css`
    color: ${failed ? theme.colorErrorText : theme.colorTextSecondary};
    word-break: break-word;
  `}
`;

const Track = styled.div`
  ${({ theme }) => css`
    height: ${theme.sizeUnit / 2}px;
    border-radius: ${theme.sizeUnit / 2}px;
    background: ${theme.colorBorderSecondary};
    overflow: hidden;
  `}
`;

const Fill = styled.div<{ percent: number }>`
  ${({ theme, percent }) => css`
    height: 100%;
    width: ${percent}%;
    background: ${theme.colorPrimary};
    transition: width 0.2s ease;
  `}
`;

// Hidden rather than removed: the button below drives it via click(), which
// only works while the input is still in the document.
const HiddenInput = styled.input`
  display: none;
`;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return t('%s B', bytes);
  if (bytes < 1024 * 1024) return t('%s KB', Math.round(bytes / 1024));
  return t('%s MB', (bytes / (1024 * 1024)).toFixed(1));
};

/**
 * Decide what a file is, or reject it.
 *
 * Extension and MIME type are both consulted because neither is reliable on
 * its own: browsers report `.sql` as an empty type, and a file dragged from a
 * zip viewer can arrive with a type but a meaningless name.
 */
const classify = (file: File): AttachmentKind | null => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (SUPPORTED_IMAGE_TYPES.has(type)) return 'image';
  if (type.startsWith('image/')) return null;
  if (name.endsWith('.csv') || type === 'text/csv') return 'csv';
  if (name.endsWith('.sql') || type === 'application/sql') return 'sql';
  if (name.endsWith('.pdf') || type === 'application/pdf') return 'pdf';
  return null;
};

/** True when a drag or paste is carrying files rather than text. */
export const carriesFiles = (transfer: DataTransfer | null): boolean =>
  !!transfer && Array.from(transfer.types ?? []).includes('Files');

let counter = 0;
const nextLocalId = (): string => {
  counter += 1;
  return `attachment-${counter}`;
};

export interface UseAttachmentsResult {
  items: AttachmentItem[];
  /** Ids to send with the next message. Excludes failures. */
  ids: number[];
  /** True while at least one file is still being uploaded. */
  uploading: boolean;
  addFiles: (files: FileList | File[] | null) => void;
  removeItem: (localId: string) => void;
  /** Forget every chip, e.g. once the message carrying them has been sent. */
  clear: () => void;
}

/**
 * Owns the composer's attachment list.
 *
 * Uploads start the moment a file is chosen rather than on send, so a large
 * CSV is already being parsed while the user is still typing the question
 * about it.
 *
 * @param ensureConversation resolves the conversation to attach to, creating
 *   one if the chat has not started yet. Attachments are scoped to a
 *   conversation, so a file chosen in an empty chat has to bring one into
 *   existence.
 */
export function useAttachments(
  ensureConversation: () => Promise<number>,
): UseAttachmentsResult {
  const [items, setItems] = useState<AttachmentItem[]>([]);

  // The ref, not the state, is the source of truth: uploads complete out of
  // order and out of band, and each callback needs the list as it is now
  // rather than as it was when the callback was created.
  const itemsRef = useRef<AttachmentItem[]>([]);
  const abortsRef = useRef(new Map<string, () => void>());

  const publish = useCallback((next: AttachmentItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const patch = useCallback(
    (localId: string, changes: Partial<AttachmentItem>) => {
      publish(
        itemsRef.current.map(item =>
          item.localId === localId ? { ...item, ...changes } : item,
        ),
      );
    },
    [publish],
  );

  const upload = useCallback(
    async (localId: string, file: File) => {
      let conversationId: number;
      try {
        conversationId = await ensureConversation();
      } catch (error) {
        patch(localId, {
          error: await describeApiError(
            error,
            t('Could not start a conversation to attach this file to.'),
          ),
        });
        return;
      }

      // The user may have removed the chip while the conversation was being
      // created; uploading a file nobody is waiting for wastes their bandwidth.
      if (!itemsRef.current.some(item => item.localId === localId)) return;

      const abort = uploadAttachment(conversationId, file, {
        onProgress: percent => patch(localId, { progress: percent }),
        onDone: (attachment: Attachment) => {
          abortsRef.current.delete(localId);
          // Trust the server's view of the file over the guess made locally.
          patch(localId, {
            attachment,
            progress: 100,
            filename: attachment.filename,
            kind: attachment.kind,
            sizeBytes: attachment.size_bytes,
          });
        },
        onError: async reason => {
          abortsRef.current.delete(localId);
          patch(localId, {
            error: await describeApiError(
              reason,
              t('This file could not be uploaded.'),
            ),
          });
        },
      });
      abortsRef.current.set(localId, abort);
    },
    [ensureConversation, patch],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[] | null) => {
      const files = Array.from(incoming ?? []);
      if (!files.length) return;

      const added: AttachmentItem[] = [];
      const toUpload: { localId: string; file: File }[] = [];
      let room = MAX_FILES - itemsRef.current.length;

      files.forEach(file => {
        const kind = classify(file);
        const localId = nextLocalId();
        const base = {
          localId,
          filename: file.name || t('Pasted image'),
          sizeBytes: file.size,
          kind: kind ?? 'other',
          progress: 0,
          attachment: null,
        };

        if (room <= 0) {
          added.push({
            ...base,
            error: t('Too many attachments. Remove one before adding another.'),
          });
          return;
        }
        if (!kind) {
          added.push({
            ...base,
            error: t(
              'Unsupported file type. Attach a CSV, SQL, PDF or image file.',
            ),
          });
          return;
        }
        if (file.size > MAX_FILE_BYTES) {
          added.push({
            ...base,
            error: t(
              'Too large to attach. The limit is %s.',
              formatBytes(MAX_FILE_BYTES),
            ),
          });
          return;
        }

        room -= 1;
        added.push({ ...base, error: null });
        toUpload.push({ localId, file });
      });

      publish([...itemsRef.current, ...added]);
      toUpload.forEach(({ localId, file }) => {
        upload(localId, file);
      });
    },
    [publish, upload],
  );

  const removeItem = useCallback(
    (localId: string) => {
      abortsRef.current.get(localId)?.();
      abortsRef.current.delete(localId);

      const target = itemsRef.current.find(item => item.localId === localId);
      publish(itemsRef.current.filter(item => item.localId !== localId));

      const serverId = target?.attachment?.id;
      // A failed delete is deliberately silent: the chip is already gone, and
      // an error about a row the user has dismissed is noise they cannot act on.
      if (serverId) deleteAttachment(serverId).catch(() => undefined);
    },
    [publish],
  );

  const clear = useCallback(() => {
    abortsRef.current.forEach(abort => abort());
    abortsRef.current.clear();
    publish([]);
  }, [publish]);

  // Abandon uploads still in flight when the panel goes away, rather than
  // leaving requests running against a component that can no longer show them.
  useEffect(() => {
    const aborts = abortsRef.current;
    return () => {
      aborts.forEach(abort => abort());
      aborts.clear();
    };
  }, []);

  return {
    items,
    ids: items
      .filter(item => !item.error && item.attachment?.status !== 'failed')
      .map(item => item.attachment?.id)
      .filter((id): id is number => typeof id === 'number'),
    uploading: items.some(item => !item.error && !item.attachment),
    addFiles,
    removeItem,
    clear,
  };
}

interface AttachmentListProps {
  items: AttachmentItem[];
  onRemove: (localId: string) => void;
}

/** The chips shown above the composer input. */
export const AttachmentList: FunctionComponent<AttachmentListProps> = ({
  items,
  onRemove,
}) => {
  if (!items.length) return null;

  return (
    <List>
      {items.map(item => {
        const KindIcon = KIND_ICON[item.kind] ?? Icons.FileOutlined;
        const serverFailed = item.attachment?.status === 'failed';
        const failed = !!item.error || serverFailed;
        const uploading = !item.error && !item.attachment;

        let detail: string | null = null;
        if (item.error) {
          detail = item.error;
        } else if (serverFailed) {
          detail =
            item.attachment?.error ?? t('This file could not be processed.');
        } else if (item.attachment?.status === 'pending') {
          detail = t('Reading this file...');
        } else if (item.attachment?.summary) {
          detail = item.attachment.summary;
        }

        return (
          <Chip key={item.localId} failed={failed}>
            <KindIcon />
            <ChipBody>
              <ChipTitle>
                <span className="filename" title={item.filename}>
                  {item.filename}
                </span>
                <span className="size">{formatBytes(item.sizeBytes)}</span>
                {uploading && <span className="size">{item.progress}%</span>}
                {!failed && item.attachment?.status === 'ready' && (
                  <Icons.CheckCircleOutlined />
                )}
                {item.attachment?.status === 'pending' && (
                  <Icons.LoadingOutlined />
                )}
                {failed && <Icons.CloseCircleOutlined />}
              </ChipTitle>
              {uploading && (
                <Track>
                  <Fill percent={item.progress} />
                </Track>
              )}
              {detail && <ChipDetail failed={failed}>{detail}</ChipDetail>}
            </ChipBody>
            <Button
              buttonStyle="link"
              buttonSize="xsmall"
              aria-label={t('Remove %s', item.filename)}
              tooltip={t('Remove')}
              icon={<Icons.CloseOutlined />}
              onClick={() => onRemove(item.localId)}
            />
          </Chip>
        );
      })}
    </List>
  );
};

interface AttachButtonProps {
  onFiles: (files: FileList | File[] | null) => void;
  disabled?: boolean;
}

/** The paperclip control that opens the file picker. */
export const AttachButton: FunctionComponent<AttachButtonProps> = ({
  onFiles,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onFiles(event.target.files);
      // Clearing the value lets the same file be chosen twice in a row, which
      // otherwise fires no change event at all.
      event.target.value = '';
    },
    [onFiles],
  );

  return (
    <>
      <HiddenInput
        ref={inputRef}
        type="file"
        multiple
        tabIndex={-1}
        aria-hidden
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleChange}
      />
      <Button
        buttonStyle="tertiary"
        disabled={disabled}
        aria-label={t('Attach a file')}
        tooltip={t('Attach a CSV, SQL, PDF or image file')}
        icon={<Icons.LinkOutlined />}
        onClick={() => inputRef.current?.click()}
      />
    </>
  );
};
