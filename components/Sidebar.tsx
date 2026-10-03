"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useBidForgeTheme } from "../app/theme-provider";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const workspaceItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "Analyze",
    href: "/analyze",
    icon: "⌕",
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: "◫",
  },
  {
    label: "Proposals",
    href: "/proposal",
    icon: "✎",
  },
];

const knowledgeItems: NavItem[] = [
  {
    label: "Knowledge Base",
    href: "/profile",
    icon: "◇",
  },
];

const accountItems: NavItem[] = [
  {
    label: "Profile",
    href: "/profile",
    icon: "○",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "⚙",
  },
];

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

function NavigationItem({
  item,
  pathname,
  onClose,
}: {
  item: NavItem;
  pathname: string;
  onClose: () => void;
}) {
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" &&
      pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={[
        "group flex h-10 items-center gap-3 rounded-[10px]",
        "px-3 text-sm font-medium",
        "transition-all duration-150",
        isActive
          ? "bg-primary-soft text-primary"
          : "text-muted hover:bg-surface-subtle hover:text-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-5 w-5 items-center justify-center",
          "text-base leading-none",
          isActive ? "text-primary" : "text-muted",
        ].join(" ")}
        aria-hidden="true"
      >
        {item.icon}
      </span>

      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useBidForgeTheme();

  const [userName, setUserName] = useState("Account");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      setUserName(
        profile?.full_name ||
          user.email?.split("@")[0] ||
          "Account",
      );
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50",
          "flex w-[250px] flex-col",
          "border-r border-border",
          "bg-surface",
          "transition-transform duration-200",
          "lg:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-sm font-bold text-white shadow-sm">
              B
            </span>

            <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              BidForge
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
              Workspace
            </p>

            <div className="space-y-1">
              {workspaceItems.map((item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
              Knowledge
            </p>

            <div className="space-y-1">
              {knowledgeItems.map((item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
              Account
            </p>

            <div className="space-y-1">
              {accountItems.map((item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-full items-center justify-between rounded-[10px] px-3 text-sm text-muted transition-colors hover:bg-surface-subtle hover:text-foreground"
          >
            <span className="flex items-center gap-3">
              <span className="text-base">
                {theme === "light" ? "☼" : "☾"}
              </span>

              <span>
                {theme === "light"
                  ? "Light mode"
                  : "Dark mode"}
              </span>
            </span>

            <span className="text-xs text-muted-light">
              {theme === "light" ? "Light" : "Dark"}
            </span>
          </button>

          <div className="mt-2 flex items-center gap-3 rounded-[10px] bg-surface-subtle px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {userName}
              </p>

              <button
                type="button"
                onClick={handleSignOut}
                className="mt-0.5 text-[11px] text-muted hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}