import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

/** Navigation styled as a button — renders an <a>, per semantic HTML rules. */
export function ButtonLink({ variant, size, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
