import { useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { fieldClasses, labelClasses } from './fieldStyles';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, className = '', id, type, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  // Password fields get a show/hide toggle.
  const isPassword = type === 'password';
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={inputId} className={labelClasses}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && isRevealed ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-10 ${fieldClasses(Boolean(error))} ${isPassword ? 'pr-10' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsRevealed((revealed) => !revealed)}
            disabled={rest.disabled}
            aria-label={isRevealed ? 'Hide password' : 'Show password'}
            aria-pressed={isRevealed}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-graphite transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isRevealed ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
