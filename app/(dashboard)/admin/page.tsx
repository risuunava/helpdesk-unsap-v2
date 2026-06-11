"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useAdminTickets } from "@/hooks/useAdminTickets";
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
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PageContainer from "@/components/layout/page-container";
import { Icons } from "@/components/icons";

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const {
    tickets,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    setPage,
    updateFilter,
  } = useAdminTickets();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    void fetchAnalytics();
  }, []);

  const navigateToDetail = (id: string) => {
    router.push(`/admin/tiket/${id}`);
  };

  const infoContent = {
    title: "Dashboard Overview",
    sections: [
      {
        title: "Panduan Cepat",
        description: "Gunakan dashboard ini untuk memantau tiket masuk, mengelola prioritas, dan memastikan SLA terpenuhi tepat waktu.",
      },
      {
        title: "Metrik KPI",
        description: "Angka di atas menunjukkan performa sistem secara real-time. Pastikan bagian 'Active State' tidak menumpuk terlalu banyak.",
      }
    ]
  };

  return (
    <PageContainer 
      pageTitle="Dashboard Overview" 
      pageDescription="Pantau dan kelola tiket dukungan dari satu tempat terpusat."
      infoContent={infoContent}
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <Card className="@container/card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
            <CardHeader>
              <CardDescription>Semua Tiket</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                {loadingAnalytics ? "--" : analytics?.kpi?.total || 0}
              </CardTitle>
              <CardAction>
                <Icons.stack className="h-4 w-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Total volume tiket masuk
            </CardFooter>
          </Card>

          <Card className="@container/card border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardDescription className="text-amber-600 dark:text-amber-400 font-medium">Active State</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-amber-500 @[250px]/card:text-3xl">
                {loadingAnalytics
                  ? "--"
                  : (analytics?.kpi?.open + analytics?.kpi?.in_progress) || 0}
              </CardTitle>
              <CardAction>
                <Icons.activity className="h-4 w-4 text-amber-500" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Sedang dalam pemrosesan
            </CardFooter>
          </Card>

          <Card className="@container/card border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardDescription className="text-green-600 dark:text-green-400 font-medium">Resolved</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-green-500 @[250px]/card:text-3xl">
                {loadingAnalytics ? "--" : analytics?.kpi?.resolved || 0}
              </CardTitle>
              <CardAction>
                <Icons.check className="h-4 w-4 text-green-500" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Tiket yang sudah diselesaikan
            </CardFooter>
          </Card>

          <Card className={cn("@container/card", analytics?.kpi?.overdue > 0 ? "border-red-500/20 bg-red-500/5" : "")}>
            <CardHeader>
              <CardDescription className={cn(analytics?.kpi?.overdue > 0 && "text-red-600 dark:text-red-400 font-medium")}>SLA Overdue</CardDescription>
              <CardTitle className={cn("text-2xl font-bold tabular-nums @[250px]/card:text-3xl", analytics?.kpi?.overdue > 0 ? "text-red-500" : "")}>
                {loadingAnalytics ? "--" : analytics?.kpi?.overdue || 0}
              </CardTitle>
              <CardAction>
                <Icons.warning
                  className={cn(
                    "h-4 w-4",
                    analytics?.kpi?.overdue > 0 ? "text-red-500" : "text-muted-foreground"
                  )}
                />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Tiket melewati batas waktu
            </CardFooter>
          </Card>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 w-full md:w-auto items-center gap-2">
              <div className="relative flex-1 md:flex-none">
                <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari tiket..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="h-9 w-full md:w-[200px] pl-9 lg:w-[250px] rounded-lg border-border/60 text-sm"
                />
              </div>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => updateFilter("status", value === "all" ? "" : value)}
              >
                <SelectTrigger className="h-9 w-[110px] md:w-[120px] rounded-lg border-border/60">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40 self-end md:self-auto">
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
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Icons.spinner className="h-8 w-8 animate-spin text-accent" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Registry</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-4 bg-muted/30 rounded-full mb-4">
                    <Icons.help className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Registry Empty</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-6 max-w-[240px]">
                    No tickets found matching active deployment filters.
                  </p>
                  <Button variant="outline" size="sm" className="rounded-lg h-8 text-[11px] font-bold uppercase tracking-widest" onClick={() => updateFilter("search", "")}>
                    Reset Filter
                  </Button>
                </div>
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="hover:bg-transparent border-b bg-muted/30">
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          Identifier
                        </th>
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          Judul & Pelapor
                        </th>
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          Kategori
                        </th>
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          Status
                        </th>
                        <th className="h-10 px-6 text-right align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          SLA Target
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
                                {t.is_anonymous ? "Principal: Anon" : t.reporter?.full_name} •{" "}
                                {new Date(t.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="h-[64px] px-6 align-middle">
                            <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-widest bg-muted/30 border-border/60">
                              {t.category}
                            </Badge>
                          </td>
                          <td className="h-[64px] px-6 align-middle">
                            <StatusBadge status={t.status as any} />
                          </td>
                          <td className="h-[64px] px-6 align-middle text-right">
                            <SlaIndicator deadline={t.sla_deadline} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 bg-muted/5">
                  {tickets.map((t) => (
                    <Card
                      key={t.id}
                      onClick={() => navigateToDetail(t.id)}
                      className="cursor-pointer hover:border-accent/40 transition-all border-border/60 bg-card group shadow-sm overflow-hidden flex flex-col"
                    >
                      <CardHeader className="p-3 md:p-4 border-b border-border/10 bg-muted/20">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <CardDescription className="font-mono font-bold text-accent text-[10px]">
                              #{t.ticket_number}
                            </CardDescription>
                            <CardTitle className="text-sm font-bold line-clamp-2 leading-tight group-hover:text-accent transition-colors">{t.title}</CardTitle>
                          </div>
                          <StatusBadge status={t.status as any} />
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span>{t.category}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <PriorityBadge priority={t.priority as any} />
                          <div className="hidden sm:block">
                            <SlaIndicator deadline={t.sla_deadline} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-muted/80 backdrop-blur-md text-foreground p-4 rounded-xl border border-border/40 shadow-lg mt-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Total Resources: <span className="text-foreground">{totalCount}</span>
              </span>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent/10 rounded-lg"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <Icons.chevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-[11px] font-mono font-bold tracking-widest">
                  {String(page).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent/10 rounded-lg"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <Icons.chevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
