"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  SquaresFour, 
  PlusCircle, 
  ChartBar, 
  Brain, 
  SignOut,
  IdentificationCard
} from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'

interface SidebarProps {
  role?: 'mahasiswa' | 'admin' | 'master_admin'
  userName?: string
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role = 'mahasiswa', userName = 'User', onClose }: SidebarProps) {
  const pathname = usePathname()

  const links = role === 'mahasiswa' 
    ? [
        { href: '/mahasiswa', label: 'Dashboard', icon: Icons.dashboard },
        { href: '/mahasiswa/submit', label: 'Submit Tiket', icon: Icons.add },
      ]
    : [
        { href: '/admin', label: 'Dashboard', icon: Icons.dashboard },
        { href: '/admin/analytics', label: 'Analytics', icon: Icons.trendingUp },
        { href: '/admin/ml', label: 'Kelola ML', icon: Icons.kanban },
      ]

  const roleLabel = role.replace('_', ' ')
  const roleBadgeClass = role === 'mahasiswa'
    ? 'bg-accent/10 text-accent border-accent/20'
    : role === 'admin'
    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    : 'bg-zinc-900 text-white border-transparent'

  return (
    <aside className="w-[280px] bg-background border-r border-border/60 h-full flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      <div className="p-7 px-8">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="size-9 bg-accent/5 rounded-xl border border-accent/10 flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-sm">
            <img src="/assets/UNSAP.png" alt="UNSAP Logo" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl tracking-tight text-text-primary leading-none">UNSAP</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Helpdesk v2</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        <div className="px-4 mb-4">
           <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-50">System Navigation</h2>
        </div>
        
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative",
                isActive 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-text-secondary hover:bg-muted hover:text-text-primary'
              )}
            >
              <Icon className={cn(
                "size-4.5 transition-colors",
                isActive ? "text-white" : "text-text-muted group-hover:text-accent"
              )} />
              {link.label}
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-5 bg-white/40 rounded-full"
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-6">
        <div className="p-5 rounded-[1.5rem] bg-muted/50 border border-border/40 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute -top-10 -right-10 size-24 bg-accent/5 blur-2xl rounded-full group-hover:bg-accent/10 transition-colors" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-card border border-border/60 shadow-xs flex items-center justify-center shrink-0">
                <Icons.user className="size-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-text-primary truncate leading-tight">{userName}</p>
                <span className={cn(
                  "inline-block px-2 py-0.5 mt-1 rounded-md text-[9px] font-bold tracking-wider uppercase border",
                  roleBadgeClass
                )}>
                  {roleLabel}
                </span>
              </div>
            </div>
            
            <form action="/api/auth/logout" method="POST" className="border-t border-border/40 pt-3">
              <button type="submit" className="w-full flex items-center gap-2.5 py-2 text-[12px] text-muted-foreground hover:text-red-600 transition-all text-left font-bold group/btn">
                <Icons.logout className="size-4 group-hover/btn:translate-x-0.5 transition-transform" /> 
                Keluar Sesi
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  )
}
