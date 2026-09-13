"use client";

import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  let title = "Dashboard";
  if (pathname.startsWith("/jobs/new")) title = "Create Job";
  else if (pathname.includes("/edit")) title = "Edit Job";
  else if (pathname.startsWith("/jobs/")) title = "Job Details";
  else if (pathname.startsWith("/jobs")) title = "Jobs";
  else if (pathname.startsWith("/executions/")) title = "Execution Details";

  return (
    <header className="flex h-14 items-center border-b px-6 bg-background">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
