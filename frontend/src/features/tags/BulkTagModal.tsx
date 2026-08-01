import { useState, useEffect, FC } from 'react';
import { ModalTitleWithIcon } from 'src/components/ModalTitleWithIcon';
import { t } from '@zobi.dev/extension-api/translation';
import { ZobiClient } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';
import {
  FormLabel,
  AsyncSelect,
  Button,
  Modal,
} from '@zobi.dev/core/components';
import { loadTags } from 'src/components/Tag/utils';
import { TaggableResourceOption } from 'src/features/tags/TagModal';

const BulkTagModalContainer = styled.div`
  .bulk-tag-text {
    margin-bottom: ${({ theme }) => theme.sizeUnit * 2.5}px;
  }
`;

interface BulkTagModalProps {
  onHide: () => void;
  refreshData: () => void;
  addSuccessToast: (msg: string) => void;
  addDangerToast: (msg: string) => void;
  show: boolean;
  selected: any[];
  resourceName: string;
}

const BulkTagModal: FC<BulkTagModalProps> = ({
  show,
  selected = [],
  onHide,
  refreshData,
  resourceName,
  addSuccessToast,
  addDangerToast,
}) => {
  useEffect(() => {}, []);
  const [tags, setTags] = useState<TaggableResourceOption[]>([]);

  const onSave = async () => {
    await ZobiClient.post({
      endpoint: `/api/v1/tag/bulk_create`,
      jsonPayload: {
        tags: tags.map(tag => ({
          name: tag.label,
          objects_to_tag: selected.map(item => [
            resourceName,
            +item.original.id,
          ]),
        })),
      },
    })
      .then(({ json = {} }) => {
        const skipped = json.result.objects_skipped;
        const tagged = json.result.objects_tagged;
        if (skipped.length > 0) {
          addSuccessToast(
            t(
              '%s items could not be tagged because you don’t have edit permissions to all selected objects.',
              skipped.length,
              resourceName,
            ),
          );
        }
        addSuccessToast(t('Tagged %s %ss', tagged.length, resourceName));
      })
      .catch(err => {
        addDangerToast(t('Failed to tag items'));
      });

    refreshData();
    onHide();
    setTags([]);
  };

  return (
    <Modal
      title={<ModalTitleWithIcon title={t('Bulk tag')} />}
      show={show}
      onHide={() => {
        setTags([]);
        onHide();
      }}
      footer={
        <div>
          <Button
            data-test="modal-save-dashboard-button"
            buttonStyle="secondary"
            onClick={onHide}
          >
            {t('Cancel')}
          </Button>
          <Button
            data-test="modal-save-dashboard-button"
            buttonStyle="primary"
            onClick={onSave}
          >
            {t('Save')}
          </Button>
        </div>
      }
    >
      <BulkTagModalContainer>
        <div className="bulk-tag-text">
          {t('You are adding tags to %s %ss', selected.length, resourceName)}
        </div>
        <FormLabel>{t('Tags')}</FormLabel>
        <AsyncSelect
          ariaLabel="tags"
          // @ts-expect-error
          value={tags}
          options={loadTags}
          onHide={onHide}
          // @ts-expect-error
          onChange={tags => setTags(tags)}
          getPopupContainer={() => document.body}
          placeholder={t('Select Tags')}
          mode="multiple"
        />
      </BulkTagModalContainer>
    </Modal>
  );
};

export default BulkTagModal;
