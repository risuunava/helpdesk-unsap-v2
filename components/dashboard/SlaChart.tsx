'use client'

import React from 'react'
import { motion } from 'motion/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface SlaData {
  month: string
  compliance: number
}

interface SlaChartProps {
  data: SlaData[]
}

export function SlaChart({ data }: SlaChartProps) {
  const getColor = (value: number) => {
    if (value >= 80) return '#10b981' // emerald-500
    if (value >= 60) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="group relative flex flex-col bg-white border border-zinc-200/60 rounded-[2rem] p-8 overflow-hidden shadow-glass hover:shadow-xl transition-all duration-500"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Efficiency</h3>
          <p className="text-xl font-bold text-zinc-900 mt-1">Kepatuhan SLA</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-mono font-bold text-emerald-600">
            {data[data.length - 1]?.compliance}%
          </span>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
            <XAxis 
              dataKey="month" 
              fontSize={11} 
              fontFamily="var(--font-mono)"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#a1a1aa' }}
              dy={10}
            />
            <YAxis 
              fontSize={11} 
              fontFamily="var(--font-mono)"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#a1a1aa' }}
              tickFormatter={(value) => `${value}%`} 
            />
            <Tooltip
              cursor={{ fill: '#f8fafc', radius: 8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-[12px] font-bold shadow-2xl border border-white/10 backdrop-blur-xl">
                      <p className="opacity-60 uppercase tracking-widest text-[10px] mb-1">{payload[0].payload.month}</p>
                      <p className="text-emerald-400">{payload[0].value}% Compliance</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="compliance" radius={[8, 8, 4, 4]} barSize={32}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.compliance)} 
                  fillOpacity={0.8}
                  className="hover:fill-opacity-100 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
