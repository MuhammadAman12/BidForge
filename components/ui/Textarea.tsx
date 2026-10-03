import type {
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    footer?: ReactNode;
  };

export function Textarea({
  label,
  hint,
  error,
  required = false,
  footer,
  id,
  className = "",
  ...props
}: TextareaProps) {
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

      <textarea
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
          "min-h-[120px] w-full resize-y rounded-[10px]",
          "border border-border",
          "bg-surface",
          "px-3 py-2.5",
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
          className,
        ].join(" ")}
        {...props}
      />

      {footer ? (
        <div className="mt-1.5 flex items-center justify-between gap-3">
          {error ? (
            <p
              id={`${id}-error`}
              className="text-xs text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          ) : hint ? (
            <p
              id={`${id}-hint`}
              className="text-xs text-muted"
            >
              {hint}
            </p>
          ) : (
            <span />
          )}

          {footer}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}