"use client";

import React, { useState } from "react";
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
  CardContent,
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
import { exportToExcel, exportToPDF } from "@/lib/export";
import { 
  FileDown, 
  FileSpreadsheet, 
  FileText,
  LayoutList,
  LayoutGrid,
  Star
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

export default function FullReportsPage() {
  const router = useRouter();
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

  const navigateToDetail = (id: string) => {
    router.push(`/admin/tiket/${id}`);
  };

  return (
    <PageContainer 
      pageTitle="Full Reports" 
      pageDescription="Daftar lengkap seluruh tiket dukungan dengan fitur pencarian dan ekspor."
    >
      <div className="flex flex-1 flex-col gap-4">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/60 font-bold text-[10px] uppercase tracking-widest gap-2">
                    <FileDown size={14} />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => exportToExcel(tickets, 'Tiket_Helpdesk')}
                    className="cursor-pointer gap-2 py-2"
                  >
                    <FileSpreadsheet size={16} className="text-green-600" />
                    <span>Export to Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => exportToPDF(tickets, 'Laporan Tiket Helpdesk', 'Tiket_Helpdesk')}
                    className="cursor-pointer gap-2 py-2"
                  >
                    <FileText size={16} className="text-red-600" />
                    <span>Export to PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40 self-end md:self-auto">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => setViewMode("table")}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
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
                        <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-[0.1em]">
                          Rating
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
                          <td className="h-[64px] px-6 align-middle">
                            {t.rating ? (
                              <div className="flex items-center gap-1">
                                <Star size={14} className="fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold">{t.rating}/5</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
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
                        {t.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={12} className={star <= t.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"} />
                            ))}
                          </div>
                        )}
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
    </PageContainer>
  );
}
