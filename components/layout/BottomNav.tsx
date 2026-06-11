"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

interface BottomNavProps {
  role?: "mahasiswa" | "admin" | "master_admin";
}

export function BottomNav({ role = "mahasiswa" }: BottomNavProps) {
  const pathname = usePathname();

  const links = role === 'mahasiswa' 
    ? [
        { href: '/mahasiswa', label: 'Home', icon: Icons.dashboard },
        { href: '/mahasiswa/submit', label: 'Tiket', icon: Icons.add },
        { href: '/notifications', label: 'Notif', icon: Icons.notification },
        { href: '/profile', label: 'Profil', icon: Icons.user },
      ]
    : [
        { href: '/admin', label: 'Home', icon: Icons.dashboard },
        { href: '/admin/analytics', label: 'Stats', icon: Icons.trendingUp },
        { href: '/admin/ml', label: 'ML', icon: Icons.kanban },
        { href: '/notifications', label: 'Notif', icon: Icons.notification },
      ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[999] flex h-16 items-center justify-around border-t bg-white dark:bg-zinc-950 px-2 pb-safe md:hidden border-border shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 transition-all duration-300 h-full",
              isActive ? "text-accent" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "flex h-8 w-12 items-center justify-center rounded-2xl transition-all duration-300",
              isActive && "bg-accent/10"
            )}>
              <Icon className="size-5" />
            </div>
            <span className={cn(
              "text-[10px] font-bold tracking-tight transition-all",
              isActive ? "opacity-100" : "opacity-70"
            )}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
