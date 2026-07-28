import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'dark' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: 'bg-dawn-gold text-[#241A08] hover:brightness-105',
  dark: 'bg-ink-night text-white hover:brightness-110',
  ghost: 'bg-white text-slate border border-line hover:bg-paper-2',
};

export function Button({ variant = 'dark', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
