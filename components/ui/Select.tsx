import type {
  ReactNode,
  SelectHTMLAttributes,
} from "react";

type SelectProps =
  SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
  };

export function Select({
  label,
  hint,
  error,
  required = false,
  id,
  children,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <select
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${id}-error`
            : hint
              ? `${id}-hint`
              : undefined
        }
        className={[
          "h-10 w-full rounded-[10px]",
          "border border-border",
          "bg-surface",
          "px-3",
          "text-sm text-foreground",
          "shadow-sm",
          "outline-none",
          "transition-all duration-150",
          "focus:border-primary",
          "focus:ring-2",
          "focus:ring-primary/15",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : "",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </select>

      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p
          id={`${id}-hint`}
          className="mt-1.5 text-xs text-muted"
        >
          {hint}
        </p>
      )}
    </div>
  );
}