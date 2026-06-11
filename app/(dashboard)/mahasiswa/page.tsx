"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useTickets } from "@/hooks/useTickets";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { SlaIndicator } from "@/components/ui/SlaIndicator";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/page-container";
import { Icons } from "@/components/icons";

export default function MahasiswaDashboard() {
  const { tickets, loading } = useTickets();
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("grid");

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed")
      .length,
  };

  const navigateToDetail = (id: string) => {
    router.push(`/mahasiswa/tiket/${id}`);
  };

  const infoContent = {
    title: "Laporan Saya",
    sections: [
      {
        title: "Transparansi Laporan",
        description: "Semua laporan Anda diproses secara transparan. Anda dapat melihat status dan estimasi penyelesaian di sini.",
      },
      {
        title: "SLA (Service Level Agreement)",
        description: "Batas waktu penyelesaian ditentukan berdasarkan prioritas masalah. Tim kami berusaha menyelesaikan sebelum batas waktu.",
      }
    ]
  };

  return (
    <PageContainer
      pageTitle="Laporan Saya"
      pageDescription="Pantau perkembangan keluhan Anda secara transparan."
      infoContent={infoContent}
      pageHeaderAction={
        <Button size="sm" asChild className="rounded-xl shadow-lg shadow-accent/20">
          <Link href="/mahasiswa/submit">
            <Icons.add className="mr-2 h-4 w-4" />
            Buat Laporan
          </Link>
        </Button>
      }
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <Card className="@container/card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Semua Laporan</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">{loading ? "--" : stats.total}</CardTitle>
              <CardAction>
                <Icons.stack className="h-4 w-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
          </Card>
          <Card className="@container/card border-amber-500/20 bg-amber-500/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-600 dark:text-amber-400 font-medium">Menunggu</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-amber-500 @[250px]/card:text-3xl">{loading ? "--" : stats.open}</CardTitle>
              <CardAction>
                <Icons.clock className="h-4 w-4 text-amber-500" />
              </CardAction>
            </CardHeader>
          </Card>
          <Card className="@container/card border-blue-500/20 bg-blue-500/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">Diproses</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-blue-500 @[250px]/card:text-3xl">{loading ? "--" : stats.in_progress}</CardTitle>
              <CardAction>
                <Icons.activity className="h-4 w-4 text-blue-500" />
              </CardAction>
            </CardHeader>
          </Card>
          <Card className="@container/card border-green-500/20 bg-green-500/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-600 dark:text-green-400 font-medium">Selesai</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-green-500 @[250px]/card:text-3xl">{loading ? "--" : stats.resolved}</CardTitle>
              <CardAction>
                <Icons.check className="h-4 w-4 text-green-500" />
              </CardAction>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
               <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-2 opacity-60">Daftar Aktivitas</h3>
            </div>
            <div className="flex bg-muted/40 p-1 rounded-lg border border-border/40">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => setViewMode("table")}
              >
                <Icons.list className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => setViewMode("grid")}
              >
                <Icons.dashboard className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card/50 overflow-hidden shadow-sm border-border/40">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-24 space-y-4">
                  <Icons.spinner className="h-8 w-8 animate-spin text-accent" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Memuat Laporan...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center">
                  <div className="p-4 bg-muted/30 rounded-full mb-4">
                    <Icons.help className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Belum ada laporan</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-6 max-w-[240px]">
                    Anda belum pernah mengirimkan keluhan atau laporan.
                  </p>
                  <Button size="sm" asChild className="rounded-xl h-8 text-[11px] font-bold uppercase tracking-widest">
                    <Link href="/mahasiswa/submit">Buat Laporan Sekarang</Link>
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="p-3 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 bg-muted/5">
                  {tickets.map((t) => (
                    <Card
                      key={t.id}
                      onClick={() => navigateToDetail(t.id)}
                      className="cursor-pointer hover:border-accent/40 transition-all border-border/60 bg-card group shadow-sm overflow-hidden"
                    >
                      <CardHeader className="pb-2 pt-4 px-4 md:px-6 md:pb-3 border-b border-border/20 bg-muted/30">
                        <div className="flex items-center justify-between mb-1">
                          <CardDescription className="font-mono font-bold text-accent text-[11px]">
                            ID:{t.ticket_number}
                          </CardDescription>
                          <StatusBadge status={t.status as any} />
                        </div>
                        <CardTitle className="text-sm font-bold line-clamp-2 mt-2 leading-tight group-hover:text-accent transition-colors h-[40px]">{t.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-3 md:p-6 md:pt-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                          {t.category} • {t.created_at ? new Date(t.created_at).toLocaleDateString() : "-"}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                          <PriorityBadge priority={t.priority as any} />
                          {t.status !== "resolved" && t.status !== "closed" && (
                            <SlaIndicator deadline={t.sla_deadline} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="hover:bg-transparent border-b bg-muted/30">
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          No. Tiket
                        </th>
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          Judul Laporan
                        </th>
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          Status
                        </th>
                        <th className="h-10 px-6 text-right align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          Tanggal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {tickets.map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => navigateToDetail(t.id)}
                          className="transition-colors hover:bg-muted/40 cursor-pointer group"
                        >
                          <td className="h-[64px] px-6 align-middle font-mono font-bold text-accent text-xs">
                            <span className="bg-accent/5 px-2 py-1 rounded">#{t.ticket_number}</span>
                          </td>
                          <td className="h-[64px] px-6 align-middle">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground group-hover:text-accent transition-colors truncate max-w-md">{t.title}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5">
                                {t.category}
                              </span>
                            </div>
                          </td>
                          <td className="h-[64px] px-6 align-middle">
                            <StatusBadge status={t.status as any} />
                          </td>
                          <td className="h-[64px] px-6 align-middle text-right text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
                            {t.created_at ? new Date(t.created_at).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
