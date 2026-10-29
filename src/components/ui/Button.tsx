import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant,
  size,
  isLoading = false,
  icon,
  className,
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}
