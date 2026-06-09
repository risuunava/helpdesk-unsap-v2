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

interface SlaData {
  month: string
  compliance: number
}

interface SlaChartProps {
  data: SlaData[]
}

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <g>
      {/* Background Track */}
      <rect x={x} y={0} width={width} height={props.background.height} fill="var(--muted)" fillOpacity={0.1} rx={4} />
      {/* Active Bar */}
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={4}>
        <animate attributeName="height" from="0" to={height} dur="1s" fill="freeze" />
      </rect>
      {/* Top Cap */}
      <rect x={x} y={y - 2} width={width} height={4} fill={fill} rx={2} filter="blur(2px)" />
    </g>
  );
};

export function SlaChart({ data }: SlaChartProps) {
  const getColor = (value: number) => {
    if (value >= 85) return 'var(--primary)'
    if (value >= 75) return 'var(--secondary)'
    return '#ef4444' // rose-500
  }

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
            data={data} 
            margin={{ top: 20, right: 0, left: -25, bottom: 0 }}
            barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
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
            tickFormatter={(value) => `${value}%`} 
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background/90 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: getColor(payload[0].value as number) }} />
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{payload[0].payload.month}</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-foreground font-mono tracking-tighter">{payload[0].value}%</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase pb-1 tracking-widest">Compliance</span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <ReferenceLine 
            y={80} 
            stroke="var(--primary)" 
            strokeDasharray="3 3" 
            strokeOpacity={0.5}
            label={{ 
                value: 'TARGET_MTX', 
                position: 'left', 
                fill: 'var(--primary)', 
                fontSize: 8, 
                fontWeight: 900,
                letterSpacing: '0.1em'
            }} 
          />
          <Bar 
            dataKey="compliance" 
            shape={<CustomBar />} 
            barSize={16}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColor(entry.compliance)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
