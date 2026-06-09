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
  ReferenceLine
} from 'recharts'
import { cn } from '@/lib/utils'

interface SentimentData {
  month: string
  score: number
}

interface SentimentChartProps {
  data: SentimentData[]
}

const CustomSentimentBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  const radius = 6;
  
  return (
    <g>
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill={fill} 
        rx={radius}
        className="filter drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
      >
        <animate attributeName="opacity" from="0.5" to="1" dur="1s" repeatCount="1" />
      </rect>
      {/* Gloss Effect */}
      <rect 
        x={x + 2} 
        y={y + 2} 
        width={width / 3} 
        height={height - 4} 
        fill="white" 
        fillOpacity={0.1} 
        rx={radius / 2} 
      />
    </g>
  );
};

export function SentimentChart({ data }: SentimentChartProps) {
  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return '#10b981' // emerald-500
    if (score >= 0.5) return '#f59e0b' // amber-500
    return '#f43f5e' // rose-500
  }

  const getSentimentLabel = (score: number) => {
    if (score >= 0.7) return 'Optimized'
    if (score >= 0.5) return 'Stable'
    return 'Critical'
  }

  return (
    <div className="w-full h-full min-h-[350px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={1} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="1 4" 
            vertical={false} 
            stroke="var(--foreground)" 
            strokeOpacity={0.1} 
          />
          
          <XAxis 
            dataKey="month" 
            fontSize={10} 
            fontFamily="var(--font-mono)"
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontWeight: 700 }}
            dy={10}
            tickFormatter={(val) => val.toUpperCase()}
          />
          
          <YAxis 
            fontSize={10} 
            fontFamily="var(--font-mono)"
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontWeight: 700 }}
            domain={[0, 1]}
            tickFormatter={(val) => `${(val * 100).toFixed(0)}`}
          />

          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const score = payload[0].value as number;
                return (
                  <div className="bg-background/90 backdrop-blur-xl border border-border p-5 rounded-2xl shadow-2xl min-w-[180px]">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3">
                        Period: {payload[0].payload.month}
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-end justify-between gap-4">
                            <span className="text-4xl font-black text-foreground font-mono tracking-tighter">
                                {(score * 100).toFixed(0)}
                            </span>
                            <div 
                                className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border"
                                style={{ 
                                    backgroundColor: `${getSentimentColor(score)}10`, 
                                    color: getSentimentColor(score),
                                    borderColor: `${getSentimentColor(score)}30`
                                }}
                            >
                                {getSentimentLabel(score)}
                            </div>
                        </div>
                        
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                <span>Polarity Index</span>
                                <span>{(score * 10).toFixed(1)}/10</span>
                            </div>
                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full transition-all duration-1000" 
                                    style={{ width: `${score * 100}%`, backgroundColor: getSentimentColor(score) }} 
                                />
                            </div>
                        </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />

          <ReferenceLine 
            y={0.5} 
            stroke="var(--border)" 
            strokeDasharray="4 4" 
            label={{ value: 'NEUTRAL_BASE', position: 'right', fill: 'var(--muted-foreground)', fontSize: 8, fontWeight: 900 }} 
          />

          <Bar 
            dataKey="score" 
            barSize={40}
            shape={<CustomSentimentBar />}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getSentimentColor(entry.score)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
