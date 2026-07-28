import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-soft">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(
          'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-slate outline-none',
          'focus:border-dawn-gold transition',
          error && 'border-ember',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-ember">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
