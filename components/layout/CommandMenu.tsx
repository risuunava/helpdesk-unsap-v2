"use client";

import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults as KBarResultsComp,
  useMatches,
} from "kbar";
import { useRouter } from "next/navigation";
import {
  IconDashboard,
  IconPlus,
  IconHistory,
  IconChartPie,
  IconRobot,
} from "@tabler/icons-react";

export default function CommandMenu({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = [
    {
      id: "dashboard",
      name: "Dashboard",
      shortcut: ["d"],
      keywords: "overview stats",
      perform: () => router.push("/mahasiswa"),
      icon: <IconDashboard className="h-5 w-5" />,
    },
    {
      id: "submit",
      name: "Buat Laporan",
      shortcut: ["n"],
      keywords: "new submit report ticket",
      perform: () => router.push("/mahasiswa/submit"),
      icon: <IconPlus className="h-5 w-5" />,
    },
    {
      id: "admin_overview",
      name: "Admin Overview",
      shortcut: ["a", "o"],
      keywords: "admin overview stats",
      perform: () => router.push("/admin"),
      icon: <IconDashboard className="h-5 w-5" />,
    },
    {
      id: "analytics",
      name: "Analytics",
      shortcut: ["a", "a"],
      keywords: "admin analytics charts",
      perform: () => router.push("/admin/analytics"),
      icon: <IconChartPie className="h-5 w-5" />,
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="z-[99999] bg-background/80 backdrop-blur-sm">
          <KBarAnimator className="w-full max-w-[600px] overflow-hidden rounded-xl border bg-background shadow-2xl">
            <div className="flex items-center border-b px-3">
              <KBarSearch className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">ESC</span>
              </kbd>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              <KBarResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
}

function KBarResults() {
  const { results } = useMatches();

  return (
    <KBarResultsComp
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {item}
          </div>
        ) : (
          <div
            className={`flex cursor-pointer items-center justify-between px-3 py-3 transition-colors ${
              active ? "bg-accent text-accent-foreground" : "text-foreground"
            } rounded-lg`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.name}</span>
                {item.subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {item.subtitle}
                  </span>
                )}
              </div>
            </div>
            {item.shortcut?.length ? (
              <div className="flex items-center gap-1">
                {item.shortcut.map((sc) => (
                  <kbd
                    key={sc}
                    className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                  >
                    {sc.toUpperCase()}
                  </kbd>
                ))}
              </div>
            ) : null}
          </div>
        )
      }
    />
  );
}
