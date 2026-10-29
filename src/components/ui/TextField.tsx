import { useId, type InputHTMLAttributes } from 'react';
import { fieldClasses, labelClasses } from './fieldStyles';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, className = '', id, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      <label htmlFor={inputId} className={labelClasses}>
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-10 ${fieldClasses(Boolean(error))}`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
