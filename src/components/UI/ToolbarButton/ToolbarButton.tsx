import { FC } from 'react';
import { IToolbarButtonProps } from './types';

const ToolbarButton: FC<IToolbarButtonProps> = ({
  children,
  isActive = false,
  className = '',
  disabled,
  ...rest
}) => {
  const stateClassName = isActive
    ? 'bg-gray-bg-active text-primary'
    : `text-muted-text ${disabled ? '' : 'hover:bg-gray-bg-hover hover:text-text-color'}`;
  const interactionClassName = disabled ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer';

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isActive}
      className={`${stateClassName} ${interactionClassName} inline-flex items-center justify-center p-1.5 text-sm font-medium rounded-md outline-none focus-visible:outline-2 focus-visible:outline-primary transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ToolbarButton;
