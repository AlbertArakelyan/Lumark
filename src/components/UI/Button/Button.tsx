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
  const isIconOnly = size.startsWith('icon-');
  const isInactive = disabled || isLoading;

  const buttonSize = useMemo(() => {
    const sizeMapping: Record<ButtonSizeType, string> = {
      xs: 'h-6 px-2 text-xs',
      sm: 'h-7 px-3 text-sm',
      md: 'h-8 px-4 text-sm',
      lg: 'h-10 px-5 text-base',
      xl: 'h-12 px-6 text-lg',
      'icon-xs': 'h-6 w-6',
      'icon-sm': 'h-7 w-7',
      'icon-md': 'h-8 w-8',
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

  // Icon buttons usually sit inside 8px rows, so they default one radius step smaller to nest cleanly.
  const buttonRounded = useMemo(() => {
    const roundedMapping: Record<ButtonRoundedType, string> = {
      default: isIconOnly ? 'rounded-md' : 'rounded-lg',
      sm: 'rounded-md',
      lg: 'rounded-lg',
      circle: 'rounded-full',
    };

    return roundedMapping[rounded] || roundedMapping.default;
  }, [rounded, isIconOnly]);

  const iconPositionMarginClass = useMemo(() => {
    if (isIconOnly) {
      return '';
    }

    return iconPosition === 'left' ? 'ml-2' : 'mr-2';
  }, [iconPosition, isIconOnly]);

  return (
    <button
      className={`inline-flex shrink-0 items-center justify-center font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary transition-[color,background-color,border-color,transform] duration-150 ${isInactive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-[0.97]'} ${buttonSize} ${buttonColor} ${buttonRounded} ${className}`}
      disabled={isInactive}
      {...rest}
    >
      <span className={`flex items-center justify-center ${buttonContainerClassName}`}>
        {icon ? (
          <>
            {iconPosition === 'left' && icon}
            {children && (
              <span className={`${iconPositionMarginClass} ${buttonContentClassName}`}>
                {children}
              </span>
            )}
            {iconPosition === 'right' && icon}
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
};

export default Button;
