import { FC, useMemo } from 'react';
import { ButtonRoundedType, ButtonSizeType, ButtonVariantType, IButtonProps } from './types';

const Button: FC<IButtonProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  rounded = 'default',
  icon,
  iconPosition = 'left',
  isLoading,
  buttonContainerClassName = '',
  buttonContentClassName = '',
  className = '',
  disabled,
  ...rest
}) => {
  const buttonSize = useMemo(() => {
    const sizeMapping: Record<ButtonSizeType, string> = {
      xs: 'h-6 px-2 text-xs',
      sm: 'h-7 px-3 text-sm',
      md: 'h-8 px-4 text-sm',
      lg: 'h-10 px-5 text-base',
      xl: 'h-12 px-6 text-lg',
      'square-icon': 'p-1',
    };

    return sizeMapping[size] || sizeMapping.md;
  }, [size]);

  // Feedback fills use text-on-primary rather than white: in dark mode every fill is a light tone.
  const buttonColor = useMemo(() => {
    const variantMapping: Record<ButtonVariantType, string> = {
      primary: 'bg-primary hover:bg-primary-hover active:bg-primary-active text-on-primary',
      secondary: 'bg-secondary hover:bg-secondary-hover active:bg-secondary-active text-on-primary',
      ghost: 'bg-transparent hover:bg-ghost-button-hover-gray-bg active:bg-ghost-button-active-gray-bg text-muted-text hover:text-text-color',
      'ghost-danger': 'bg-transparent hover:bg-danger-bg active:bg-danger-bg text-muted-text hover:text-danger',
      outline: 'bg-transparent border border-border-color hover:bg-gray-bg-hover hover:border-border-strong active:bg-gray-bg-active text-text-color',
      danger: 'bg-danger hover:bg-danger-hover active:bg-danger-active text-on-primary',
      success: 'bg-success hover:bg-success-hover active:bg-success-active text-on-primary',
      warning: 'bg-warning hover:bg-warning-hover active:bg-warning-active text-on-primary',
      info: 'bg-info hover:bg-info-hover active:bg-info-active text-on-primary',
    };

    return variantMapping[variant] || variantMapping.primary;
  }, [variant]);

  const buttonRounded = useMemo(() => {
    const roundedMapping: Record<ButtonRoundedType, string> = {
      default: 'rounded-md',
      rounded: 'rounded-lg',
      circle: 'rounded-full',
    };

    return roundedMapping[rounded] || roundedMapping.default;
  }, [rounded]);

  const iconPositionMarginClass = useMemo(() => {
    if (size === 'square-icon') {
      return '';
    }

    return iconPosition === 'left' ? 'mr-2' : 'ml-2';
  }, [iconPosition, size]);

  return (
    <button
      className={`shrink-0 font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary hover:cursor-pointer transition-colors ${buttonSize} ${buttonColor} ${buttonRounded} ${disabled || isLoading ? '!cursor-not-allowed opacity-50' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      <div className={`flex items-center justify-center ${buttonContainerClassName}`}>
        {icon ? (
          <>
            {iconPosition === 'left' && icon}
            <div className={`${iconPositionMarginClass} ${buttonContentClassName}`}>
              {children}
            </div>
            {iconPosition === 'right' && icon}
          </>
        ) : (
          children
        )}
      </div>
    </button>
  );
};

export default Button;
