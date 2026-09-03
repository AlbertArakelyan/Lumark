import { FC, MouseEvent, useEffect, useId, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from 'lucide-react';
import { IModalProps, ModalSizeType } from './types';
import Button from '../Button/Button';

const Modal: FC<IModalProps> = ({
  children,
  isOpen,
  title,
  onClose,
  size = 'md',
  footer,
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  backdropClassName = '',
  headerClassName = '',
  titleClassName = '',
  bodyClassName = '',
  footerClassName = '',
  closeButtonClassName = '',
  className = '',
  ...rest
}) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const modalSize = useMemo(() => {
    const sizeMapping: Record<ModalSizeType, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-2xl',
    };

    return sizeMapping[size] || sizeMapping.md;
  }, [size]);

  // Capturing the trigger before moving focus is what makes the restore correct, so both halves
  // have to stay in this one effect - splitting them breaks under StrictMode's double-invoke.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const autoFocusElement = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]');

    (autoFocusElement || panelRef.current)?.focus();

    return () => previouslyFocusedElement?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Comparing target to currentTarget keeps content clicks from closing the modal without a
  // stopPropagation() on the panel, which would silently kill outside-click listeners above us.
  // mousedown rather than click so dragging a selection out of the panel doesn't dismiss it.
  const handleBackdropMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick || e.target !== e.currentTarget) {
      return;
    }

    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ${backdropClassName}`}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full ${modalSize} max-h-[85vh] flex flex-col bg-surface text-text-color border border-border-color rounded-xl shadow-xl outline-none ${className}`}
        {...rest}
      >
        <div className={`shrink-0 flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-border-color ${headerClassName}`}>
          <h2 id={titleId} className={`text-lg font-semibold truncate ${titleClassName}`}>
            {title}
          </h2>
          {showCloseButton && (
            <Button
              type="button"
              variant="ghost"
              size="square-icon"
              rounded="circle"
              icon={<XIcon size={16} />}
              aria-label="Close dialog"
              className={`shrink-0 ${closeButtonClassName}`}
              onClick={onClose}
            />
          )}
        </div>
        <div className={`flex-1 min-h-0 overflow-y-auto px-5 py-4 ${bodyClassName}`}>
          {children}
        </div>
        {footer && (
          <div className={`shrink-0 flex items-center justify-end gap-2 px-5 py-3 border-t border-border-color ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
