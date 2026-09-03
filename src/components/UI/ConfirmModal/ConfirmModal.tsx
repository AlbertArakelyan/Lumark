import { FC } from 'react';
import { IConfirmModalProps } from './types';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';

const ConfirmModal: FC<IConfirmModalProps> = ({
  isOpen,
  title,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isConfirming = false,
  size = 'sm',
  onConfirm,
  onCancel,
  contentClassName = '',
  confirmButtonClassName = '',
  cancelButtonClassName = '',
  ...props
}) => {
  // Escape, the backdrop and the close button all funnel here so an in-flight confirm can't be
  // abandoned halfway.
  const handleClose = () => {
    if (isConfirming) {
      return;
    }

    onCancel();
  };

  const confirmModalFooter = (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={isConfirming}
        className={`border border-border-color ${cancelButtonClassName}`}
        onClick={handleClose}
      >
        {cancelText}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={confirmVariant}
        isLoading={isConfirming}
        className={confirmButtonClassName}
        data-autofocus
        onClick={onConfirm}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      size={size}
      footer={confirmModalFooter}
      onClose={handleClose}
      {...props}
    >
      <div className={`text-sm text-muted-text ${contentClassName}`}>
        {content}
      </div>
    </Modal>
  );
};

export default ConfirmModal;
