import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "blue"
  | "success"
  | "warning"
  | "danger";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral:
    "border-border bg-surface-subtle text-muted",

  blue:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-400",

  success:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400",

  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400",

  danger:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400",
};

const dotClasses: Record<BadgeVariant, string> = {
  neutral: "bg-slate-400",
  blue: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

export function Badge({
  children,
  variant = "neutral",
  dot = false,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full",
        "border",
        "px-2.5 py-1",
        "text-xs font-medium",
        "leading-none",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {dot && (
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            dotClasses[variant],
          ].join(" ")}
          aria-hidden="true"
        />
      )}

      {children}
    </span>
  );
}