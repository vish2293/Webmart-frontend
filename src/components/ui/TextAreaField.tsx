import { useId, type TextareaHTMLAttributes } from 'react';
import { fieldClasses, labelClasses } from './fieldStyles';

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function TextAreaField({ label, error, className = '', ...rest }: TextAreaFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={fieldClasses(Boolean(error))}
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
