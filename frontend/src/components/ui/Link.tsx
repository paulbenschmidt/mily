import NextLink from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  variant?: 'primary' | 'secondary' | 'muted';
  children: ReactNode;
}

export default function Link({ href, variant = 'primary', className = '', children, ...props }: LinkProps) {
  const variantStyles = {
    primary: 'text-primary-600 hover:text-primary-700 font-medium',
    secondary: 'text-info-600 hover:text-info-700 font-medium',
    muted: 'text-secondary-500 hover:text-secondary-600',
  };

  return (
    <NextLink
      href={href}
      className={`transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </NextLink>
  );
}
