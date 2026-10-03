import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
};

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  padding = "md",
  hover = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-[16px]",
        "border border-border",
        "bg-surface",
        "shadow-sm",
        "text-foreground",
        paddingClasses[padding],
        hover
          ? "transition-all duration-150 hover:-translate-y-[1px] hover:border-border-strong hover:shadow-md"
          : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}