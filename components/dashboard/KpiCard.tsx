'use client'

import React from 'react'
import { motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function KpiCard({ title, value, icon: Icon, subtitle, variant = 'default' }: KpiCardProps) {
  const variants = {
    default: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    danger: 'text-rose-600 bg-rose-50 border-rose-100',
  }

  const iconVariants = {
    default: 'bg-indigo-500/10 text-indigo-600',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-rose-500/10 text-rose-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-card border border-border/60 rounded-[2rem] p-6 overflow-hidden shadow-glass transition-all duration-500"
    >
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl ${iconVariants[variant]} transition-colors duration-500`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{title}</h3>
            <p className="text-3xl font-mono font-bold text-foreground mt-1">{value}</p>
          </div>
        </div>
        
        {subtitle && (
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${variant === 'default' ? 'bg-indigo-400' : variant === 'success' ? 'bg-emerald-400' : variant === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
            <p className="text-[11px] font-bold text-muted-foreground line-clamp-1">{subtitle}</p>
          </div>
        )}
      </div>

      {/* Decorative background glow */}
      <div className={`absolute -bottom-12 -right-12 w-24 h-24 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${variant === 'default' ? 'bg-indigo-500' : variant === 'success' ? 'bg-emerald-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
    </motion.div>
  )
}
