import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="btn__spinner" aria-hidden />
      ) : (
        icon && <span className="btn__icon">{icon}</span>
      )}
      {children}
    </button>
  );
}
