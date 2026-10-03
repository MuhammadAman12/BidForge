import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  leading?: ReactNode;
};

export function Input({
  label,
  hint,
  error,
  required = false,
  leading,
  id,
  className = "",
  ...props
}: InputProps) {
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

      <div className="relative">
        {leading && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {leading}
          </div>
        )}

        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${id}-error`
              : hint
                ? `${id}-hint`
                : undefined
          }
          required={required}
          className={[
            "h-10 w-full rounded-[10px]",
            "border border-border",
            "bg-surface",
            "px-3",
            "text-sm text-foreground",
            "shadow-sm",
            "placeholder:text-muted-light",
            "outline-none",
            "transition-all duration-150",
            "focus:border-primary",
            "focus:ring-2",
            "focus:ring-primary/15",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : "",
            leading ? "pl-9" : "",
            className,
          ].join(" ")}
          {...props}
        />
      </div>

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