import { type HTMLAttributes } from 'react';
import styles from './Heading.module.css';

export type HeadingVariant =
  | 'hero-xl'
  | 'hero'
  | 'display-xl'
  | 'display'
  | 'section'
  | 'subsection';
export type HeadingColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'danger';
type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  variant?: HeadingVariant;
  as?: HeadingElement;
  color?: HeadingColor;
}

const variantClass: Record<HeadingVariant, string> = {
  'hero-xl': styles.heroXl as string,
  hero: styles.hero as string,
  'display-xl': styles.displayXl as string,
  display: styles.display as string,
  section: styles.section as string,
  subsection: styles.subsection as string,
};

const colorClass: Partial<Record<HeadingColor, string>> = {
  secondary: styles.colorSecondary as string,
  muted: styles.colorMuted as string,
  accent: styles.colorAccent as string,
  danger: styles.colorDanger as string,
};

export function Heading({
  variant = 'section',
  as: Tag = 'h2',
  color,
  className,
  children,
  ...props
}: HeadingProps) {
  const cls = [
    styles.heading as string,
    variantClass[variant],
    color ? colorClass[color] : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cls} {...props}>
      {children}
    </Tag>
  );
}
