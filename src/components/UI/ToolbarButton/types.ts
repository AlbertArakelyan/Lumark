import { PropsWithChildren, ButtonHTMLAttributes } from 'react';

export type ToolbarButtonSizeType = 'sm' | 'md';

export interface IToolbarButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  size?: ToolbarButtonSizeType;
}
