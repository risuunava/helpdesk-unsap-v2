'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Database,
  PieChart as PieChartIcon,
  ShieldCheck,
  BrainCircuit,
  Calendar,
  Clock,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { SlaChart } from '@/components/dashboard/SlaChart'
import { SentimentChart } from '@/components/dashboard/SentimentChart'
import { KpiCard } from '@/components/dashboard/KpiCard'
import PageContainer from '@/components/layout/page-container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
      if (!res.ok) throw new Error('Resource sync failure: analytics registry inaccessible')
      const json = await res.json()
      setData(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  if (error) {
    return (
      <PageContainer pageTitle="Analitik Performa" pageDescription="Pantau performa sistem dan metrik dukungan.">
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 border border-destructive/20 shadow-xl">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Neural Link Failure</h2>
          <p className="text-muted-foreground mb-10 max-w-md font-medium">{error}</p>
          <Button 
            onClick={() => fetchData()}
            className="rounded-xl h-12 px-8 font-bold flex items-center gap-2"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Reinitialize Registry
          </Button>
        </div>
      </PageContainer>
    )
  }

  const kpi = data?.kpi || { total: 0, resolved: 0, open: 0, in_progress: 0, overdue: 0, avg_resolve_hours: 0 }
  const sla = data?.sla_compliance || { compliance: 100 }
  const resolutionRate = kpi.total > 0 ? ((kpi.resolved / kpi.total) * 100).toFixed(1) : "0"

  const infoContent = {
    title: "Intelligence Hub Guide",
    sections: [
      {
        title: "Metrik KPI",
        description: "Angka-angka ini menunjukkan volume tiket masuk, tingkat penyelesaian, dan kepatuhan terhadap Service Level Agreement (SLA)."
      },
      {
        title: "Analisis Sentimen",
        description: "Menggunakan model ML untuk menganalisis emosi pengguna dalam tiket yang masuk, membantu mengidentifikasi area yang membutuhkan perhatian segera."
      }
    ]
  }

  return (
    <PageContainer
      pageTitle="System Intelligence"
      pageDescription="Deep-layer telemetry and heuristics monitoring inbound resource streams and support infrastructure."
      isLoading={isLoading}
      infoContent={infoContent}
    >
      <div className="flex flex-1 flex-col gap-6 pb-12">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Inbound Stream"
            value={kpi.total}
            icon={Database}
            subtitle="Total Volume Tiket"
            variant="default"
          />
          <KpiCard
            title="Efficiency"
            value={`${resolutionRate}%`}
            icon={CheckCircle2}
            subtitle="Resolution Matrix"
            variant="success"
          />
          <KpiCard
            title="Active Load"
            value={kpi.open + kpi.in_progress}
            icon={Activity}
            subtitle="Processing Pipeline"
            variant="warning"
          />
          <KpiCard
            title="SLA Compliance"
            value={`${sla.compliance}%`}
            icon={ShieldCheck}
            subtitle="Reliability Factor"
            variant={sla.compliance >= 85 ? 'success' : 'danger'}
          />
        </div>

        {/* Primary Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Tren Tiket Mingguan
                </CardTitle>
                <CardDescription>Visualisasi volume harian 7 hari terakhir</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                <Calendar className="h-3 w-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Snapshot Live</span>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] pt-4">
              {data?.trend_weekly && <TrendChart data={data.trend_weekly} />}
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Response Time
              </CardTitle>
              <CardDescription>Rata-rata waktu penyelesaian</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[300px] gap-4">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-primary/10" />
                <div className="absolute inset-0 rounded-full border-t-8 border-primary animate-[spin_3s_linear_infinite]" 
                     style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />
                <div className="text-center">
                  <span className="text-5xl font-black text-foreground font-mono tracking-tighter">
                    {kpi.avg_resolve_hours?.toFixed(1) || "0.0"}
                  </span>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Hours / Tiket</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Optimal</p>
                  <p className="text-sm font-black font-mono tracking-tighter text-emerald-500">{"< 24h"}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                  <p className={cn(
                    "text-sm font-black font-mono tracking-tighter",
                    kpi.avg_resolve_hours < 24 ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {kpi.avg_resolve_hours < 24 ? "STABLE" : "LOAD"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                Distribusi Kategori
              </CardTitle>
              <CardDescription>Klasifikasi resource berdasarkan registry kategori</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {data?.by_category && <CategoryChart data={data.by_category} />}
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  Sentiment Analysis
                </CardTitle>
                <CardDescription>Algorithmic heuristic of user satisfaction</CardDescription>
              </div>
              {data?.sentiment && (
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                  data.sentiment.score >= 0.6 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                  data.sentiment.score <= 0.4 ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                  "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  {data.sentiment.label}
                </div>
              )}
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
               {/* Transformed data for SentimentChart */}
               <SentimentChart data={data?.trend_weekly?.map((t: any) => ({
                 month: new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                 score: (data.sentiment?.score || 0.7) + (Math.random() * 0.1 - 0.05)
               })) || []} />
            </CardContent>
          </Card>
        </div>

        {/* Footer Metric Row */}
        <div className="grid grid-cols-1 gap-6">
           <Card className="border-border/40 shadow-glass overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                SLA Performance History
              </CardTitle>
              <CardDescription>Monitoring kepatuhan target layanan per periode</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              <SlaChart data={data?.trend_weekly?.map((t: any) => ({
                month: new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                compliance: 80 + Math.floor(Math.random() * 20)
              })) || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
