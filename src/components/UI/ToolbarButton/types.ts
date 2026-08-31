import { PropsWithChildren, ButtonHTMLAttributes } from 'react';

export interface IToolbarButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}
