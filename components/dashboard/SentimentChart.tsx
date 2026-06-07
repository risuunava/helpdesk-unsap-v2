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

interface SentimentData {
  month: string
  score: number
}

interface SentimentChartProps {
  data: SentimentData[]
}

export function SentimentChart({ data }: SentimentChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white border border-zinc-200/60 rounded-[2.5rem] p-10 overflow-hidden shadow-glass hover:shadow-2xl transition-all duration-700"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-indigo-500/10 transition-all duration-700" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-2">Public Perception</h3>
          <p className="text-3xl font-serif italic text-zinc-900 leading-tight">Sentiment Analytics</p>
          <p className="text-sm text-zinc-400 mt-2 max-w-md font-medium">Melacak kepuasan mahasiswa melalui analisis bahasa pada laporan tiket.</p>
        </div>
        <div className="flex items-center gap-8 bg-zinc-50/80 backdrop-blur-md px-8 py-5 rounded-[1.5rem] border border-zinc-100">
          <div className="text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Current Score</p>
            <p className="text-2xl font-mono font-bold text-indigo-600">{(data[data.length - 1]?.score * 100).toFixed(0)}%</p>
          </div>
          <div className="w-[1px] h-8 bg-zinc-200" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Sentiment</p>
            <p className="text-2xl font-bold text-zinc-800 italic">Positif</p>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="month" 
              fontSize={11} 
              fontFamily="var(--font-mono)"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8' }}
              dy={15}
            />
            <YAxis 
              fontSize={11} 
              fontFamily="var(--font-mono)"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8' }}
              domain={[0, 1]}
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{payload[0].payload.month}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <p className="text-sm font-bold text-zinc-800">Score: {Number(payload[0].value).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#sentimentGradient)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
