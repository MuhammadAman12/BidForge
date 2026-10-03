import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex min-h-[260px] w-full",
        "flex-col items-center justify-center",
        "rounded-[16px]",
        "border border-dashed border-border",
        "bg-surface-subtle",
        "px-6 py-10",
        "text-center",
        className,
      ].join(" ")}
    >
      {icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px] border border-border bg-surface text-muted shadow-sm">
          {icon}
        </div>
      )}

      <h3 className="text-sm font-semibold text-foreground">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-muted">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}