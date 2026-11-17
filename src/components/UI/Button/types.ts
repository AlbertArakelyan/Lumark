import { PropsWithChildren, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon-xs' | 'icon-sm' | 'icon-md';
export type ButtonVariantType = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost' | 'ghost-danger' | 'outline';
export type ButtonRoundedType = 'default' | 'sm' | 'lg' | 'circle';
export type ButtonIconPositionType = 'left' | 'right';

export interface IButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSizeType;
  variant?: ButtonVariantType;
  rounded?: ButtonRoundedType;
  icon?: ReactNode;
  iconPosition?: ButtonIconPositionType;
  isLoading?: boolean;
  buttonContainerClassName?: string;
  buttonContentClassName?: string;
}
