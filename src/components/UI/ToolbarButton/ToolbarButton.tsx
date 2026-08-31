import { FC } from 'react';
import { IToolbarButtonProps } from './types';

const ToolbarButton: FC<IToolbarButtonProps> = ({
  children,
  isActive = false,
  className = '',
  disabled,
  ...rest
}) => {
  const stateClassName = isActive ? 'bg-gray-300' : (disabled ? '' : 'hover:bg-gray-200');
  const interactionClassName = disabled ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer';

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isActive}
      className={`${stateClassName} ${interactionClassName} inline-flex items-center p-1 border border-gray-300 text-sm font-medium rounded-md focus:outline-none transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ToolbarButton;
