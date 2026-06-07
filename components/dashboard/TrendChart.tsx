'use client'

import React from 'react'
import { motion } from 'motion/react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendData {
  date: string
  count: number
}

interface TrendChartProps {
  data: TrendData[]
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="group relative flex flex-col bg-white border border-zinc-200/60 rounded-[2.5rem] p-10 overflow-hidden shadow-glass hover:shadow-2xl transition-all duration-700"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full -mr-40 -mt-40 group-hover:bg-emerald-500/10 transition-all duration-700" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h3 className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-2">Growth & Volume</h3>
          <p className="text-4xl font-serif text-zinc-900 tracking-tight">Ticket Volume Trend</p>
          <p className="text-sm text-zinc-400 mt-2 font-medium">Visualisasi harian laporan masuk dalam 7 hari terakhir.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-center min-w-[120px]">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Weekly Avg</p>
            <p className="text-xl font-mono font-bold text-zinc-800">
              {(data.reduce((a, b) => a + b.count, 0) / data.length).toFixed(1)}
            </p>
          </div>
          <div className="px-6 py-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center min-w-[120px]">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Peak Day</p>
            <p className="text-xl font-mono font-bold text-emerald-700">
              {Math.max(...data.map(d => d.count))}
            </p>
          </div>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              fontSize={11} 
              fontFamily="var(--font-mono)"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8' }}
              dy={15}
              tickFormatter={(val) => {
                const date = new Date(val)
                return date.toLocaleDateString('id-ID', { weekday: 'short' })
              }}
            />
            <YAxis 
              fontSize={11} 
              fontFamily="var(--font-mono)"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const date = new Date(payload[0].payload.date)
                  return (
                    <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <p className="text-sm font-bold text-zinc-800">{payload[0].value} Tiket Baru</p>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#trendGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
