"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Clock, LayoutDashboard } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Header() {
  const pathname = usePathname();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute title
  let title = "Dashboard";
  if (pathname.startsWith("/jobs/new")) title = "Create Job";
  else if (pathname.includes("/edit")) title = "Edit Job";
  else if (pathname.startsWith("/jobs/")) title = "Job Details";
  else if (pathname.startsWith("/jobs")) title = "Jobs";
  else if (pathname.startsWith("/executions/")) title = "Execution Details";

  // Compute breadcrumbs
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (pathname === "/") {
      return [{ label: "Dashboard" }];
    }

    const items: BreadcrumbItem[] = [{ label: "Dashboard", href: "/" }];

    if (pathname === "/jobs") {
      items.push({ label: "Jobs" });
    } else if (pathname === "/jobs/new") {
      items.push({ label: "Jobs", href: "/jobs" });
      items.push({ label: "Create Job" });
    } else if (pathname.includes("/edit")) {
      const segments = pathname.split("/").filter(Boolean);
      items.push({ label: "Jobs", href: "/jobs" });
      if (segments[1]) {
        items.push({ label: "Job Details", href: `/jobs/${segments[1]}` });
      }
      items.push({ label: "Edit" });
    } else if (pathname.startsWith("/jobs/")) {
      items.push({ label: "Jobs", href: "/jobs" });
      items.push({ label: "Job Details" });
    } else if (pathname.startsWith("/executions/")) {
      const segments = pathname.split("/").filter(Boolean);
      items.push({ label: "Jobs", href: "/jobs" });
      items.push({
        label: segments[1] ? `Execution #${segments[1].slice(0, 8)}` : "Execution Details",
      });
    } else {
      const segments = pathname.split("/").filter(Boolean);
      segments.forEach((seg, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        const label = seg.charAt(0).toUpperCase() + seg.slice(1);
        const isLast = idx === segments.length - 1;
        items.push(isLast ? { label } : { label, href });
      });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-border/60 bg-background/95 px-6 backdrop-blur-sm shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.02)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-border/60 after:to-transparent">
      {/* Left: Breadcrumbs + Title */}
      <div className="flex flex-col justify-center">
        {/* Breadcrumbs trail */}
        <nav aria-label="Breadcrumbs" className="flex items-center space-x-1.5 text-xs text-muted-foreground mb-0.5">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={idx} className="flex items-center space-x-1.5">
                {idx > 0 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors hover:underline underline-offset-4 flex items-center gap-1"
                  >
                    {idx === 0 && <LayoutDashboard className="h-3 w-3" />}
                    <span>{crumb.label}</span>
                  </Link>
                ) : (
                  <span className={isLast ? "font-medium text-foreground/80 flex items-center gap-1" : ""}>
                    {idx === 0 && <LayoutDashboard className="h-3 w-3" />}
                    <span>{crumb.label}</span>
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Page Title with smooth transition */}
        <div key={pathname} className="animate-fadeIn">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Clock / Time indicator */}
      <div className="flex items-center gap-3">
        {time ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/60 text-xs font-mono text-muted-foreground shadow-sm animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>{time}</span>
          </div>
        ) : (
          <div className="h-7 w-24 bg-muted/40 rounded-full animate-pulse" />
        )}
      </div>
    </header>
  );
}
