"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

interface BottomNavProps {
  role?: "mahasiswa" | "admin" | "master_admin";
}

export function BottomNav({ role = "mahasiswa" }: BottomNavProps) {
  const pathname = usePathname();
  const [activeIdx, setActiveIdx] = useState(0);

  const links =
    role === "mahasiswa"
      ? [
          { href: "/mahasiswa", label: "Home", icon: Icons.dashboard },
          { href: "/mahasiswa/submit", label: "Tiket", icon: Icons.add },
          { href: "/notifications", label: "Notif", icon: Icons.notification },
          { href: "/profile", label: "Profil", icon: Icons.user },
        ]
      : [
          { href: "/admin", label: "Home", icon: Icons.dashboard },
          { href: "/admin/analytics", label: "Stats", icon: Icons.trendingUp },
          { href: "/admin/ml", label: "ML", icon: Icons.kanban },
          { href: "/notifications", label: "Notif", icon: Icons.notification },
        ];

  useEffect(() => {
    const idx = links.findIndex((l) => l.href === pathname);
    if (idx !== -1) setActiveIdx(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[999] flex h-14 items-center justify-around bg-background/95 backdrop-blur-xl px-1 md:hidden border-t border-border/40 shadow-[0_-8px_30px_-4px_rgba(0,0,0,0.08)] overflow-visible">
      {links.map((link, idx) => {
        const Icon = link.icon;
        const isActive = idx === activeIdx;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative flex flex-col items-center justify-end flex-1 h-full pb-2 overflow-visible"
          >
            {/* Floating bubble — rendered INSIDE the link so it's always perfectly centered */}
            {isActive && (
              <motion.div
                layoutId="nav-bubble"
                className="absolute left-1/2 -translate-x-1/2 -top-[26px] w-[52px] h-[52px] pointer-events-none z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Glow halo */}
                <motion.div
                  key={`glow-${idx}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="absolute inset-0 rounded-full bg-accent/30 blur-md"
                />
                {/* Main pill */}
                <motion.div
                  key={`bubble-${idx}`}
                  initial={{ scale: 0.5, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0, y: 8 }}
                  transition={{ type: "spring", stiffness: 460, damping: 26 }}
                  className="absolute inset-0 rounded-full bg-accent flex items-center justify-center shadow-[0_8px_24px_-4px_hsl(var(--accent)/0.6),0_2px_8px_-2px_hsl(var(--accent)/0.4)]"
                >
                  <Icon className="size-[22px] text-accent-foreground" />
                </motion.div>
              </motion.div>
            )}

            {/* Inactive icon — fades out when active */}
            <motion.div
              animate={
                isActive
                  ? { opacity: 0, scale: 0.6 }
                  : { opacity: 1, scale: 1 }
              }
              transition={{ duration: 0.15 }}
              className="mb-0.5"
            >
              <Icon className="size-[19px] text-muted-foreground" />
            </motion.div>

            {/* Label */}
            <span
              className={cn(
                "text-[10px] font-bold tracking-tight leading-none transition-colors duration-200",
                isActive ? "text-accent" : "text-muted-foreground opacity-60"
              )}
            >
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
