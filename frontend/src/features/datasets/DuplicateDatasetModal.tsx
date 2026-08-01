import { t } from '@zobi.dev/extension-api/translation';
import { FunctionComponent, useEffect, useState, ChangeEvent } from 'react';
import { Input, FormLabel, Modal, Icons } from '@zobi.dev/core/components';
import { ModalTitleWithIcon } from 'src/components/ModalTitleWithIcon';
import Dataset from 'src/types/Dataset';

interface DuplicateDatasetModalProps {
  dataset: Dataset | null;
  onHide: () => void;
  onDuplicate: (newDatasetName: string) => void;
}

const DuplicateDatasetModal: FunctionComponent<DuplicateDatasetModalProps> = ({
  dataset,
  onHide,
  onDuplicate,
}) => {
  const [show, setShow] = useState<boolean>(false);
  const [disableSave, setDisableSave] = useState<boolean>(false);
  const [newDuplicateDatasetName, setNewDuplicateDatasetName] =
    useState<string>('');

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const targetValue = event.target.value ?? '';
    setNewDuplicateDatasetName(targetValue);
    setDisableSave(targetValue === '');
  };

  const duplicateDataset = () => {
    onDuplicate(newDuplicateDatasetName);
  };

  useEffect(() => {
    setNewDuplicateDatasetName('');
    setShow(dataset !== null);
  }, [dataset]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      name={t('Duplicate dataset')}
      title={
        <ModalTitleWithIcon
          title={t('Duplicate dataset')}
          icon={<Icons.CopyOutlined />}
        />
      }
      disablePrimaryButton={disableSave}
      onHandledPrimaryAction={duplicateDataset}
      primaryButtonName={t('Duplicate')}
    >
      <FormLabel htmlFor="duplicate">{t('New dataset name')}</FormLabel>
      <Input
        data-test="duplicate-modal-input"
        type="text"
        id="duplicate"
        autoComplete="off"
        value={newDuplicateDatasetName}
        onChange={onChange}
        onPressEnter={duplicateDataset}
      />
    </Modal>
  );
};

export default DuplicateDatasetModal;
