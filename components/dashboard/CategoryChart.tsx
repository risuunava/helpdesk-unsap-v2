'use client'

import React from 'react'
import { motion } from 'motion/react'
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  Cell
} from 'recharts'
import { cn } from '@/lib/utils'
import { Terminal } from 'lucide-react'

interface CategoryData {
  category: string
  count: number
}

interface CategoryChartProps {
  data: CategoryData[]
}

const COLORS = [
    'var(--primary)',
    'var(--secondary)',
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // rose
    '#8b5cf6', // violet
]

export function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  
  // Prepare data for RadialBarChart
  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.count,
    fill: COLORS[index % COLORS.length]
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col lg:flex-row items-center gap-12">
      <div className="h-[300px] w-full lg:w-1/2 relative">
        {/* Background Target Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <div className="w-[100%] h-[100%] border-4 border-foreground rounded-full" />
            <div className="absolute w-[80%] h-[80%] border-2 border-foreground rounded-full" />
            <div className="absolute w-[60%] h-[60%] border border-foreground rounded-full" />
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="30%" 
            outerRadius="100%" 
            barSize={12} 
            data={chartData}
            startAngle={90}
            endAngle={450}
          >
            <RadialBar
              background={{ fill: 'var(--muted)', opacity: 0.2 }}
              dataKey="value"
              cornerRadius={10}
              animationDuration={1500}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background/90 backdrop-blur-xl border border-border p-3 rounded-xl shadow-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                            {payload[0].name}
                        </span>
                      </div>
                      <div className="text-lg font-black font-mono tracking-tighter text-foreground">
                        {payload[0].value} <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Entries</span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-full border border-border flex flex-col items-center justify-center w-24 h-24 shadow-inner">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Aggregate</span>
                <span className="text-3xl font-black text-foreground font-mono tracking-tighter leading-none">{total}</span>
            </div>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3">
        <div className="flex items-center gap-2 mb-4 opacity-40">
            <Terminal size={12} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Registry Mapping</span>
        </div>
        
        {chartData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          return (
            <motion.div 
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group/item relative p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border overflow-hidden"
            >
              <div className="absolute left-0 top-0 w-1 h-full opacity-0 group-hover/item:opacity-100 transition-opacity" style={{ backgroundColor: item.fill }} />
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center font-mono text-[10px] font-black group-hover/item:scale-110 transition-transform">
                        0{index + 1}
                    </div>
                    <div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover/item:text-foreground transition-colors truncate max-w-[120px]">
                            {item.name}
                        </div>
                        <div className="w-full h-0.5 bg-muted mt-1 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${percentage}%` }}
                                className="h-full" 
                                style={{ backgroundColor: item.fill }} 
                            />
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-black text-foreground font-mono tracking-tighter">{item.value}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{percentage}%</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
