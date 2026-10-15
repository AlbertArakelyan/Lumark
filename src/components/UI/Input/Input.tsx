import { FC, useMemo } from 'react';
import { IInputProps, InputRoundedType, InputSizeType } from './types';

const Input: FC<IInputProps> = ({
  label,
  wrapperClassName = '',
  labelClassName = '',
  inputElSize = 'sm',
  rounded = 'default',
  icon,
  iconPosition = 'right',
  error,
  isDirty,
  className = '',
  ...props
}) => {
  const inputSize = useMemo(() => {
    if (icon) {
      const iconSizeMapping: Record<InputSizeType, string> = {
        xs: `${iconPosition === 'left' ? 'pl-7 pr-2' : 'pl-2 pr-7'} h-6 text-xs`,
        sm: `${iconPosition === 'left' ? 'pl-8 pr-3' : 'pl-3 pr-8'} h-8 text-sm`,
        md: `${iconPosition === 'left' ? 'pl-8 pr-4' : 'pl-4 pr-8'} h-9 text-sm`,
        lg: `${iconPosition === 'left' ? 'pl-9 pr-5' : 'pl-5 pr-9'} h-10 text-base`,
        xl: `${iconPosition === 'left' ? 'pl-10 pr-6' : 'pl-6 pr-10'} h-12 text-lg`,
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
      default: 'rounded-md',
      rounded: 'rounded-lg',
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
    <div className={`w-full flex items-center relative ${wrapperClassName}`}>
      {/* TODO: Support label */}
      <input
        className={`w-full min-w-0 outline-none border bg-surface text-text-color placeholder:text-muted-text/70 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${inputBorderColor} ${inputSize} ${inputRounded} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {icon && (
        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center text-muted-text ${iconPosition === 'left' ? 'left-2' : 'right-2'}`}>
          {icon}
        </div>
      )}
      {error && (
        <p className="text-danger text-xs absolute top-full mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
