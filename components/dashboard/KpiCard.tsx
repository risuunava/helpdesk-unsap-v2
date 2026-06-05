import React from 'react'
import { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'default' | 'danger' | 'success' | 'warning'
}

const variantStyles = {
  default: {
    iconBg: 'bg-bg-elevated',
    iconColor: 'text-accent',
    valuColor: 'text-text-primary',
  },
  danger: {
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-error',
    valuColor: 'text-error',
  },
  success: {
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-success',
    valuColor: 'text-success',
  },
  warning: {
    iconBg: 'bg-[#FEF3C7]',
    iconColor: 'text-warning',
    valuColor: 'text-warning',
  },
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: KpiCardProps) {
  const styles = variantStyles[variant]

  return (
    <div className="p-5 rounded-2xl border border-border bg-bg-surface shadow-capsule hover:shadow-glow transition-shadow duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${styles.iconColor}`} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.value >= 0 ? 'bg-[#ECFDF5] text-success' : 'bg-[#FEF2F2] text-error'
          }`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
      <div className={`text-3xl font-bold font-mono ${styles.valuColor} mb-0.5`}>
        {value}
      </div>
      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-text-secondary mt-1">{subtitle}</div>
      )}
    </div>
  )
}
