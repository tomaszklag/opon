import { type HTMLAttributes } from 'react';
import styles from './Text.module.css';

export type TextVariant =
  | 'body'
  | 'body-md'
  | 'body-sm'
  | 'caption'
  | 'label'
  | 'nano'
  | 'kicker'
  | 'kicker-sm';
export type TextColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'warning' | 'danger';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
type TextElement = 'p' | 'span' | 'div' | 'label' | 'li' | 'strong' | 'em';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: TextElement;
  color?: TextColor;
  weight?: TextWeight;
  mono?: boolean;
}

const variantClass: Record<TextVariant, string> = {
  body: styles.body as string,
  'body-md': styles.bodyMd as string,
  'body-sm': styles.bodySm as string,
  caption: styles.caption as string,
  label: styles.label as string,
  nano: styles.nano as string,
  kicker: styles.kicker as string,
  'kicker-sm': styles.kickerSm as string,
};

const colorClass: Partial<Record<TextColor, string>> = {
  primary: styles.colorPrimary as string,
  secondary: styles.colorSecondary as string,
  muted: styles.colorMuted as string,
  accent: styles.colorAccent as string,
  warning: styles.colorWarning as string,
  danger: styles.colorDanger as string,
};

const weightClass: Partial<Record<TextWeight, string>> = {
  medium: styles.weightMedium as string,
  semibold: styles.weightSemibold as string,
  bold: styles.weightBold as string,
  extrabold: styles.weightExtrabold as string,
};

export function Text({
  variant = 'body',
  as: Tag = 'p',
  color,
  weight,
  mono,
  className,
  children,
  ...props
}: TextProps) {
  const cls = [
    styles.text as string,
    variantClass[variant],
    color ? colorClass[color] : undefined,
    weight ? weightClass[weight] : undefined,
    mono ? (styles.mono as string) : undefined,
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
