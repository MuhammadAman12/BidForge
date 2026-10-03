import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { default: "bg-primary text-background hover:bg-primary-hover", outline: "border border-border bg-surface text-foreground hover:bg-surface-subtle" }, size: { default: "h-10 px-4 py-2", sm: "h-9 px-3" } }, defaultVariants: { variant: "default", size: "default" }
});
export function ActionButton({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
