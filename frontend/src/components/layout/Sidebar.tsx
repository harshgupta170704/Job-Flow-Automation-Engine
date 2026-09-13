"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase, Plus, Zap, LogOut, Server } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardStats } from "@/types";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSidebarStats = async () => {
      try {
        const res = await api.get<DashboardStats>("/api/dashboard/stats");
        if (res.data && isMounted) {
          setStats(res.data);
        }
      } catch {
        // Silently ignore background stats fetch error in sidebar
      }
    };

    if (user) {
      fetchSidebarStats();
      const interval = setInterval(fetchSidebarStats, 45000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [user]);

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Create Job", href: "/jobs/new", icon: Plus },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/jobs") {
      return pathname === "/jobs" || (pathname.startsWith("/jobs/") && !pathname.startsWith("/jobs/new"));
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-border/60 bg-card text-card-foreground shadow-sm">
      {/* Logo Header Area with subtle gradient */}
      <div className="relative flex h-16 items-center border-b border-border/60 px-5 bg-gradient-to-r from-card via-card to-primary/5">
        <Link href="/" className="group flex items-center gap-3 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-500 text-primary-foreground shadow-md shadow-primary/25 transition-all duration-200 group-hover:scale-105 group-hover:shadow-primary/40">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-foreground">
                JobFlow
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                v1.0
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-normal -mt-0.5">
              Automation Engine
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1"
                  )}
                >
                  {/* Active Left Border Accent Indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                  )}

                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 group-hover:scale-110 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="flex-1 truncate">{link.name}</span>

                  {/* Dynamic Job Count Badge on Jobs Link */}
                  {link.href === "/jobs" && stats?.totalJobs !== undefined && (
                    <span
                      className={cn(
                        "ml-auto text-xs font-mono font-medium px-2 py-0.5 rounded-full transition-colors",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/15 group-hover:text-foreground"
                      )}
                    >
                      {stats.totalJobs}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Worker Status Widget Card */}
        <div className="pt-2">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-colors hover:bg-muted/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>Worker Fleet</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    (stats?.workersOnline ?? 0) > 0
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-amber-500"
                  )}
                />
                <span
                  className={cn(
                    (stats?.workersOnline ?? 0) > 0
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {stats?.workersOnline !== undefined
                    ? `${stats.workersOnline} Online`
                    : "Active"}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
              {(stats?.workersOnline ?? 0) > 0
                ? "Workers ready & polling tasks"
                : "No worker instances online"}
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Section with polished spacing & design */}
      {user && (
        <div className="border-t border-border/60 p-3 bg-card/60">
          <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 text-primary font-semibold border border-primary/20 shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="truncate text-sm font-semibold text-foreground leading-tight">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground leading-tight mt-0.5">
                {user.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 shrink-0"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
