import { HTMLAttributes, ReactNode } from 'react';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function PageHeading({ className = '', children, ...props }: TypographyProps) {
  return (
    <h1 className={`text-2xl md:text-3xl font-extrabold text-secondary-900 ${className}`} {...props}>
      {children}
    </h1>
  );
}

export function SectionHeading({ className = '', children, ...props }: TypographyProps) {
  return (
    <h2 className={`text-xl md:text-2xl font-bold text-secondary-900 ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function Subheading({ className = '', children, ...props }: TypographyProps) {
  return (
    <h3 className={`text-lg md:text-xl font-semibold text-secondary-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function BodyText({ className = '', children, ...props }: TypographyProps) {
  return (
    <p className={`text-base md:text-lg text-secondary-700 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function SmallText({ className = '', children, ...props }: TypographyProps) {
  return (
    <p className={`text-sm md:text-base text-secondary-600 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function Caption({ className = '', children, ...props }: TypographyProps) {
  return (
    <p className={`text-xs md:text-sm text-secondary-500 ${className}`} {...props}>
      {children}
    </p>
  );
}
