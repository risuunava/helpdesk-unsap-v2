"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { useAdminTickets } from "@/hooks/useAdminTickets";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlaIndicator } from "@/components/ui/SlaIndicator";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageContainer from "@/components/layout/page-container";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { ArrowRight, ListFilter } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // We use useAdminTickets just to get the most recent ones for the overview
  const {
    tickets,
    loading
  } = useAdminTickets();

  // Limit to 5 most recent tickets for overview
  const recentTickets = tickets.slice(0, 5);

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

  return (
    <PageContainer 
      pageTitle="Admin Overview" 
      pageDescription="Pantau ringkasan metrik dan aktivitas tiket terbaru."
    >
      <div className="flex flex-1 flex-col gap-4">
        {/* KPI Cards */}
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

        {/* Recent Tickets Section */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Icons.history size={18} className="text-primary" />
                Laporan Terbaru
              </h3>
              <p className="text-xs text-muted-foreground">5 aktivitas tiket terakhir yang memerlukan perhatian Anda.</p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-lg h-9 font-bold text-[10px] uppercase tracking-widest gap-2 border-border/60">
              <Link href="/admin/tiket">
                Lihat Semua Laporan
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border bg-card/50 overflow-hidden shadow-sm border-border/40">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Icons.spinner className="h-6 w-6 animate-spin text-accent" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Loading Records...</p>
                </div>
              ) : recentTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-xs text-muted-foreground">Tidak ada tiket terbaru.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="hover:bg-transparent border-b bg-muted/30">
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">Identifier</th>
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">Judul & Pelapor</th>
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">Status</th>
                        <th className="h-10 px-6 text-right align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {recentTickets.map((t) => (
                        <tr
                          key={t.id}
                          className="transition-colors hover:bg-muted/40 group"
                        >
                          <td className="h-[60px] px-6 align-middle font-mono font-bold text-accent text-xs">
                            <span className="bg-accent/5 px-2 py-1 rounded">#{t.ticket_number}</span>
                          </td>
                          <td className="h-[60px] px-6 align-middle">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground truncate max-w-[200px] md:max-w-md">{t.title}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5">
                                {t.is_anonymous ? "Anon" : t.reporter?.full_name} • {new Date(t.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="h-[60px] px-6 align-middle">
                            <StatusBadge status={t.status as any} />
                          </td>
                          <td className="h-[60px] px-6 align-middle text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-lg hover:bg-accent/10"
                              onClick={() => navigateToDetail(t.id)}
                            >
                              <Icons.chevronRight size={16} className="text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
               <Link href="/admin/tiket" className="flex items-center gap-2">
                  <ListFilter size={14} />
                  Buka Halaman Laporan Lengkap
               </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
