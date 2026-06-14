import {
  IconDashboard,
  IconTicket,
  IconChartPie,
  IconRobot,
  IconSettings,
  IconPlus,
  IconHistory,
  IconBell,
} from "@tabler/icons-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
  role?: ("mahasiswa" | "admin" | "master_admin")[];
};

export const navItems: NavItem[] = [
  // Mahasiswa Nav
  {
    title: "Dashboard",
    href: "/mahasiswa",
    icon: IconDashboard,
    role: ["mahasiswa"],
  },
  {
    title: "Buat Tiket",
    href: "/mahasiswa/submit",
    icon: IconPlus,
    role: ["mahasiswa"],
  },
  {
    title: "Riwayat Tiket",
    href: "/mahasiswa", // or a dedicated list page if available
    icon: IconHistory,
    role: ["mahasiswa"],
  },

  // Admin Nav
  {
    title: "Overview",
    href: "/admin",
    icon: IconDashboard,
    role: ["admin", "master_admin"],
  },
  {
    title: "Semua Laporan",
    href: "/admin/tiket",
    icon: IconTicket,
    role: ["admin", "master_admin"],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: IconChartPie,
    role: ["admin", "master_admin"],
  },
  {
    title: "ML Management",
    href: "/admin/ml",
    icon: IconRobot,
    role: ["admin", "master_admin"],
  },

  // Global / Shared Nav (Moved to bottom)
  {
    title: "Notifikasi",
    href: "/notifications",
    icon: IconBell,
    role: ["mahasiswa", "admin", "master_admin"],
  },
];
