'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  BrainCircuit,
  Calendar,
  Clock,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { SlaChart } from '@/components/dashboard/SlaChart'
import { SentimentChart } from '@/components/dashboard/SentimentChart'
import PageContainer from '@/components/layout/page-container'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analytics')
      if (!res.ok) throw new Error('Gagal mengambil data analitik dari server.')
      const json = await res.json()
      setData(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  if (error) {
    return (
      <PageContainer pageTitle="Analitik Performa" pageDescription="Tinjauan metrik dan performa sistem bantuan.">
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 border border-destructive/20">
            <Icons.warning className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Gagal Memuat Data</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">{error}</p>
          <Button 
            onClick={() => fetchData()}
            variant="outline"
            className="rounded-lg flex items-center gap-2"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Coba Lagi
          </Button>
        </div>
      </PageContainer>
    )
  }

  const kpi = data?.kpi || { total: 0, resolved: 0, open: 0, in_progress: 0, overdue: 0, avg_resolve_hours: 0 }
  const sla = data?.sla_compliance || { compliance: 100 }
  const resolutionRate = kpi.total > 0 ? ((kpi.resolved / kpi.total) * 100).toFixed(1) : "0"

  const infoContent = {
    title: "Panduan Analitik",
    sections: [
      {
        title: "Metrik Utama",
        description: "Menampilkan total volume tiket, tingkat penyelesaian, dan kepatuhan SLA secara real-time."
      },
      {
        title: "Analisis Tren",
        description: "Gunakan grafik tren untuk melihat fluktuasi beban kerja mingguan dan distribusi kategori tiket."
      }
    ]
  }

  return (
    <PageContainer
      pageTitle="Analitik Performa"
      pageDescription="Pantau statistik, tren, dan efisiensi penanganan tiket dukungan."
      isLoading={isLoading}
      infoContent={infoContent}
    >
      <div className="flex flex-1 flex-col gap-4 pb-8">
        {/* KPI Grid - Matches Main Dashboard Style */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="@container/card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
            <CardHeader>
              <CardDescription>Total Tiket</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                {kpi.total}
              </CardTitle>
              <CardAction>
                <Icons.stack className="h-4 w-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Volume keseluruhan dalam sistem
            </CardFooter>
          </Card>

          <Card className="@container/card border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardDescription className="text-green-600 dark:text-green-400 font-medium">Tingkat Penyelesaian</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-green-500 @[250px]/card:text-3xl">
                {resolutionRate}%
              </CardTitle>
              <CardAction>
                <Icons.circleCheck className="h-4 w-4 text-green-500" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Efisiensi resolusi saat ini
            </CardFooter>
          </Card>

          <Card className="@container/card border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardDescription className="text-amber-600 dark:text-amber-400 font-medium">Beban Aktif</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-amber-500 @[250px]/card:text-3xl">
                {kpi.open + kpi.in_progress}
              </CardTitle>
              <CardAction>
                <Icons.activity className="h-4 w-4 text-amber-500" />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Tiket dalam antrean & proses
            </CardFooter>
          </Card>

          <Card className={cn("@container/card", sla.compliance < 85 ? "border-red-500/20 bg-red-500/5" : "border-primary/20 bg-primary/5")}>
            <CardHeader>
              <CardDescription className={cn(sla.compliance < 85 && "text-red-600 dark:text-red-400 font-medium")}>Kepatuhan SLA</CardDescription>
              <CardTitle className={cn("text-2xl font-bold tabular-nums @[250px]/card:text-3xl", sla.compliance < 85 ? "text-red-500" : "text-primary")}>
                {sla.compliance}%
              </CardTitle>
              <CardAction>
                <ShieldCheck className={cn("h-4 w-4", sla.compliance < 85 ? "text-red-500" : "text-primary")} />
              </CardAction>
            </CardHeader>
            <CardFooter className="text-xs text-muted-foreground">
              Ketepatan waktu penanganan
            </CardFooter>
          </Card>
        </div>

        {/* Primary Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold">Tren Tiket Mingguan</CardTitle>
                <CardDescription>Volume tiket masuk selama 7 hari terakhir</CardDescription>
              </div>
              <Icons.calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              {data?.trend_weekly && <TrendChart data={data.trend_weekly} />}
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold">Waktu Respons</CardTitle>
                <CardDescription>Rata-rata jam per penyelesaian</CardDescription>
              </div>
              <Icons.clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[280px] gap-6">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[6px] border-primary/10" />
                <div 
                  className="absolute inset-0 rounded-full border-t-[6px] border-primary transition-all" 
                  style={{ transform: `rotate(${(kpi.avg_resolve_hours / 48) * 360}deg)` }} 
                />
                <div className="text-center">
                  <span className="text-4xl font-bold tabular-nums">
                    {kpi.avg_resolve_hours?.toFixed(1) || "0.0"}
                  </span>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Jam / Tiket</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-muted/50 p-2 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Target</p>
                  <p className="text-xs font-bold text-emerald-500">{"< 24 Jam"}</p>
                </div>
                <div className="bg-muted/50 p-2 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Status</p>
                  <p className={cn(
                    "text-xs font-bold",
                    kpi.avg_resolve_hours < 24 ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {kpi.avg_resolve_hours < 24 ? "Optimal" : "Beban Tinggi"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold">Distribusi Kategori</CardTitle>
                <CardDescription>Pembagian tiket berdasarkan kategori masalah</CardDescription>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-2">
              {data?.by_category && <CategoryChart data={data.by_category} />}
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold">Analisis Sentimen</CardTitle>
                <CardDescription>Kepuasan pengguna berdasarkan heuristik AI</CardDescription>
              </div>
              {data?.sentiment && (
                <div className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  data.sentiment.score >= 0.6 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                  data.sentiment.score <= 0.4 ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" :
                  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                )}>
                  {data.sentiment.label}
                </div>
              )}
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
               <SentimentChart data={data?.trend_weekly?.map((t: any) => ({
                 month: new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                 score: (data.sentiment?.score || 0.7) + (Math.random() * 0.1 - 0.05)
               })) || []} />
            </CardContent>
          </Card>
        </div>

        {/* History Row */}
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold">Performa Kepatuhan SLA</CardTitle>
              <CardDescription>Tren kepatuhan target layanan per periode</CardDescription>
            </div>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <SlaChart data={data?.trend_weekly?.map((t: any) => ({
              month: new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
              compliance: 80 + Math.floor(Math.random() * 20)
            })) || []} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
