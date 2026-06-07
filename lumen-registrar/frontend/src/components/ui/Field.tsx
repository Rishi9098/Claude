import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import "./field.css";

interface FieldWrapProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldWrap({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: FieldWrapProps) {
  return (
    <div className="field" data-invalid={error ? "true" : undefined}>
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="field__req" aria-hidden> *</span>}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint">{hint}</p>
      ) : null}
    </div>
  );
}

export const TextInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ invalid, className = "", ...rest }, ref) => (
  <input
    ref={ref}
    className={`input ${className}`}
    data-invalid={invalid || undefined}
    {...rest}
  />
));
TextInput.displayName = "TextInput";

export const SelectInput = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(({ invalid, className = "", children, ...rest }, ref) => (
  <div className="select-wrap">
    <select
      ref={ref}
      className={`input select ${className}`}
      data-invalid={invalid || undefined}
      {...rest}
    >
      {children}
    </select>
    <svg className="select__chevron" viewBox="0 0 12 12" width="12" height="12" aria-hidden>
      <path d="M3 4.5L6 7.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
));
SelectInput.displayName = "SelectInput";
