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
  LineChart,
  Line,
  ReferenceLine
} from 'recharts'
import { cn } from '@/lib/utils'

interface TrendData {
  date: string
  count: number
}

interface TrendChartProps {
  data: TrendData[]
}

const CustomDot = (props: any) => {
  const { cx, cy, stroke, payload, value } = props;

  if (value > 15) { // Highlight peaks
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="none">
        <circle cx="10" cy="10" r="4" fill="var(--primary)" />
        <circle cx="10" cy="10" r="6" stroke="var(--primary)" strokeOpacity="0.3" strokeWidth="2" />
        <circle cx="10" cy="10" r="8" stroke="var(--primary)" strokeOpacity="0.1" strokeWidth="2">
            <animate attributeName="r" from="8" to="12" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" from="0.1" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  return <circle cx={cx} cy={cy} r={3} fill={stroke} strokeWidth={2} stroke="#fff" />;
};

export function TrendChart({ data }: TrendChartProps) {
  const avg = data.reduce((a, b) => a + b.count, 0) / data.length;

  return (
    <div className="w-full h-full min-h-[400px] relative">
      {/* Background Technical Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity={0.05} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <CartesianGrid 
            strokeDasharray="4 4" 
            vertical={true} 
            horizontal={true} 
            stroke="var(--border)" 
            strokeOpacity={0.5} 
          />
          
          <XAxis 
            dataKey="date" 
            fontSize={10} 
            fontFamily="var(--font-mono)"
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontWeight: 700 }}
            dy={15}
            tickFormatter={(val) => {
              const date = new Date(val)
              return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
            }}
          />
          
          <YAxis 
            fontSize={10} 
            fontFamily="var(--font-mono)"
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontWeight: 700 }}
            dx={-10}
          />

          <Tooltip
            cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const date = new Date(payload[0].payload.date)
                return (
                  <div className="bg-background/80 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Terminal size={40} />
                    </div>
                    
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3">
                        {date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    
                    <div className="space-y-1">
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
                                {payload[0].value}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase pb-1 tracking-widest">
                                Inbound Units
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                                Number(payload[0].value) >= avg ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                            )}>
                                {Number(payload[0].value) >= avg ? 'High Load' : 'Nominal'}
                            </div>
                            <span className="text-[9px] text-muted-foreground/50 font-mono">NODE::STABLE</span>
                        </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />

          <ReferenceLine 
            y={avg} 
            stroke="var(--muted-foreground)" 
            strokeDasharray="3 3" 
            strokeOpacity={0.3}
            label={{ 
                value: 'SYSTEM_AVG', 
                position: 'right', 
                fill: 'var(--muted-foreground)', 
                fontSize: 8, 
                fontWeight: 900,
                letterSpacing: '0.2em'
            }} 
          />

          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--primary)"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#trendGradient)"
            animationDuration={2000}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 3 }}
            style={{ filter: 'url(#glow)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

import { Terminal } from 'lucide-react'
