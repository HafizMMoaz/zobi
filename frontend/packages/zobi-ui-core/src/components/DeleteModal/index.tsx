import { t } from '@zobi/core-legacy/translation';
import { styled } from '@zobi/core-legacy/theme';
import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { FormLabel } from '../Form';
import { Input, InputRef } from '../Input';
import { Modal } from '../Modal';
import type { DeleteModalProps } from './types';

const StyledDiv = styled.div`
  padding-top: 8px;
  width: 50%;
  label {
    color: ${({ theme }) => theme.colorTextLabel};
  }
`;

export function DeleteModal({
  description,
  onConfirm,
  onHide,
  open,
  title,
  name,
}: DeleteModalProps) {
  const [disableChange, setDisableChange] = useState(true);
  const [confirmation, setConfirmation] = useState<string>('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const hide = () => {
    setConfirmation('');
    onHide();
  };

  const confirm = () => {
    setConfirmation('');
    onConfirm();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const targetValue = event.target.value ?? '';
    setDisableChange(targetValue.toUpperCase() !== t('DELETE'));
    setConfirmation(targetValue);
  };

  const onPressEnter = () => {
    if (!disableChange) {
      confirm();
    }
  };

  return (
    <Modal
      disablePrimaryButton={disableChange}
      onHide={hide}
      onHandledPrimaryAction={confirm}
      primaryButtonName={t('Delete')}
      primaryButtonStyle="danger"
      show={open}
      name={name}
      title={title}
      centered
    >
      {description}
      <StyledDiv>
        <FormLabel htmlFor="delete">
          {t('Type "%s" to confirm', t('DELETE'))}
        </FormLabel>
        <Input
          data-test="delete-modal-input"
          type="text"
          id="delete"
          autoComplete="off"
          value={confirmation}
          onChange={onChange}
          onPressEnter={onPressEnter}
          ref={inputRef}
        />
      </StyledDiv>
    </Modal>
  );
}

export type { DeleteModalProps };
