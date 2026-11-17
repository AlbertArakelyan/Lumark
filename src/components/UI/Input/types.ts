import { InputHTMLAttributes, ReactNode } from 'react';

export type InputSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type InputRoundedType = 'default' | 'sm';
export type InputIconPositionType = 'left' | 'right';

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
  inputContainerClassName?: string;
  labelClassName?: string;
  iconWrapperClassName?: string;
  errorClassName?: string;
  inputElSize?: InputSizeType;
  rounded?: InputRoundedType;
  icon?: ReactNode;
  iconPosition?: InputIconPositionType;
  label?: string;
  error?: string;
  isDirty?: boolean;
}
