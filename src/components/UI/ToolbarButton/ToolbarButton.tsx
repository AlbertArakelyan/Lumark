import { FC, useMemo } from 'react';
import { IToolbarButtonProps, ToolbarButtonSizeType } from './types';

const ToolbarButton: FC<IToolbarButtonProps> = ({
  children,
  isActive = false,
  size = 'md',
  className = '',
  disabled,
  ...rest
}) => {
  const buttonSize = useMemo(() => {
    const sizeMapping: Record<ToolbarButtonSizeType, string> = {
      sm: 'h-6 w-6',
      md: 'h-7 w-7',
    };

    return sizeMapping[size] || sizeMapping.md;
  }, [size]);

  const stateClassName = isActive
    ? 'bg-gray-bg-active text-primary'
    : `text-muted-text ${disabled ? '' : 'hover:bg-gray-bg-hover hover:text-text-color'}`;
  const interactionClassName = disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-[0.97]';

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isActive}
      className={`${stateClassName} ${interactionClassName} ${buttonSize} inline-flex shrink-0 items-center justify-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-primary transition-[color,background-color,transform] duration-150 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ToolbarButton;
