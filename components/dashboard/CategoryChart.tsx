'use client'

import React from 'react'
import { motion } from 'motion/react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface CategoryData {
  category: string
  count: number
}

interface CategoryChartProps {
  data: CategoryData[]
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="group relative flex flex-col bg-white border border-zinc-200/60 rounded-[2rem] p-8 overflow-hidden shadow-glass hover:shadow-xl transition-all duration-500"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
      
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Distribution</h3>
        <p className="text-xl font-bold text-zinc-900 mt-1">Kategori Tiket</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="h-[200px] w-[200px] shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={8}
                dataKey="count"
                nameKey="category"
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="none"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xl border border-white/10">
                        {payload[0].name}: {payload[0].value}
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</span>
            <span className="text-2xl font-mono font-bold text-zinc-800">{total}</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 w-full">
          {data.map((item, index) => {
            const percentage = ((item.count / total) * 100).toFixed(0)
            return (
              <div key={item.category} className="group/item">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[13px] font-bold text-zinc-600 capitalize">{item.category}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-400 group-hover/item:text-zinc-900 transition-colors">{percentage}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
