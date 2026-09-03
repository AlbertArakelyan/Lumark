import { HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

export type ModalSizeType = 'sm' | 'md' | 'lg' | 'xl';

export interface IModalProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  size?: ModalSizeType;
  footer?: ReactNode;
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  backdropClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;
}
