import { FC, useMemo } from 'react';
import { IInputProps, InputRoundedType, InputSizeType } from './types';

const Input: FC<IInputProps> = ({
  label,
  wrapperClassName = '',
  inputContainerClassName = '',
  labelClassName = '',
  iconWrapperClassName = '',
  errorClassName = '',
  inputElSize = 'sm',
  rounded = 'default',
  icon,
  iconPosition = 'right',
  error,
  isDirty: _isDirty,
  className = '',
  ...props
}) => {
  const inputSize = useMemo(() => {
    if (icon) {
      const iconSizeMapping: Record<InputSizeType, string> = {
        xs: `${iconPosition === 'left' ? 'pl-7 pr-2' : 'pl-2 pr-7'} h-6 text-xs`,
        sm: `${iconPosition === 'left' ? 'pl-8 pr-3' : 'pl-3 pr-8'} h-8 text-sm`,
        md: `${iconPosition === 'left' ? 'pl-9 pr-4' : 'pl-4 pr-9'} h-9 text-sm`,
        lg: `${iconPosition === 'left' ? 'pl-10 pr-5' : 'pl-5 pr-10'} h-10 text-base`,
        xl: `${iconPosition === 'left' ? 'pl-12 pr-6' : 'pl-6 pr-12'} h-12 text-lg`,
      };

      return iconSizeMapping[inputElSize] || iconSizeMapping.md;
    }

    const sizeMapping: Record<InputSizeType, string> = {
      xs: 'px-2 h-6 text-xs',
      sm: 'px-3 h-8 text-sm',
      md: 'px-4 h-9 text-sm',
      lg: 'px-5 h-10 text-base',
      xl: 'px-6 h-12 text-lg',
    };

    return sizeMapping[inputElSize] || sizeMapping.md;
  }, [icon, iconPosition, inputElSize]);

  const inputRounded = useMemo(() => {
    const roundedMapping: Record<InputRoundedType, string> = {
      default: 'rounded-lg',
      sm: 'rounded-md',
    };

    return roundedMapping[rounded] || roundedMapping.default;
  }, [rounded]);

  // Flat: state is carried by the border colour alone, no focus ring.
  const inputBorderColor = useMemo(() => {
    if (error) {
      return 'border-danger focus:border-danger';
    }

    return 'border-border-color hover:border-border-strong focus:border-primary';
  }, [error]);

  return (
    <div className={`w-full min-w-0 flex flex-col gap-1 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={props.id} className={`text-xs font-medium text-muted-text ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className={`relative flex items-center ${inputContainerClassName}`}>
        <input
          className={`w-full min-w-0 outline-none border bg-surface text-text-color placeholder:text-muted-text transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${inputBorderColor} ${inputSize} ${inputRounded} ${className}`}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {icon && (
          <div className={`absolute top-1/2 -translate-y-1/2 flex items-center text-muted-text ${iconPosition === 'left' ? 'left-2' : 'right-2'} ${iconWrapperClassName}`}>
            {icon}
          </div>
        )}
      </div>
      {/* In the flow, not absolute, so callers never have to reserve space for it by hand. */}
      {error && (
        <p className={`text-xs text-danger ${errorClassName}`} role="alert">{error}</p>
      )}
    </div>
  );
};

export default Input;
