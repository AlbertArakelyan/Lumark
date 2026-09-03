import { HTMLAttributes, ReactNode } from 'react';
import { ButtonVariantType } from '../Button/types';
import { ModalSizeType } from '../Modal/types';

export interface IConfirmModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariantType;
  isConfirming?: boolean;
  size?: ModalSizeType;
  onConfirm: () => void;
  onCancel: () => void;
  contentClassName?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}
