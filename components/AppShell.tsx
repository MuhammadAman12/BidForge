"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
  title?: string;
};

export default function AppShell({
  children,
  title,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-h-screen lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-[9px] text-muted hover:bg-surface-subtle hover:text-foreground lg:hidden"
          >
            <span className="text-lg">☰</span>
          </button>

          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="truncate text-sm font-semibold text-foreground">
                {title}
              </h1>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}