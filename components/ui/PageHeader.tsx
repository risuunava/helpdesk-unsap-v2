import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
      <div>
        <h1 className="font-display font-bold text-[28px] tracking-tight text-text-primary leading-[1.2]">{title}</h1>
        {subtitle && <p className="font-body text-[16px] text-text-secondary mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {children && <div>{children}</div>}
    </div>
  )
}
