'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, BarChart3, Brain, LogOut } from 'lucide-react'

interface SidebarProps {
  role?: 'mahasiswa' | 'admin' | 'master_admin'
}

export function Sidebar({ role = 'mahasiswa' }: SidebarProps) {
  const pathname = usePathname()

  const links = role === 'mahasiswa' 
    ? [
        { href: '/mahasiswa', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/mahasiswa/submit', label: 'Submit Tiket', icon: PlusCircle },
      ]
    : [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        ...(role === 'master_admin' ? [{ href: '/admin/ml', label: 'Kelola ML', icon: Brain }] : []),
      ]

  const roleLabel = role.replace('_', ' ')
  const roleBadgeClass = role === 'mahasiswa'
    ? 'bg-accent-subtle text-accent'
    : role === 'admin'
    ? 'bg-[#E8F5E9] text-[#2D8A4E]'
    : 'bg-text-primary text-text-inverse'

  return (
    <aside className="w-[240px] bg-bg-elevated border-r border-border min-h-screen hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-text-inverse font-display font-bold text-[15px] leading-none">U</span>
          </div>
          <span className="font-display font-bold text-[18px] text-text-primary">UNSAP</span>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        <h2 className="text-[11px] font-body font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">Menu</h2>
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-body font-medium transition-all ${
                isActive 
                  ? 'bg-accent text-text-inverse shadow-sm' 
                  : 'text-text-secondary hover:bg-bg-overlay hover:text-text-primary'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-bg-overlay border border-border flex items-center justify-center">
            <span className="font-display font-bold text-[14px] text-text-secondary">U</span>
          </div>
          <div>
            <p className="text-[14px] font-body font-medium text-text-primary">User</p>
            <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-body font-semibold tracking-wider uppercase ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST" className="mt-4 px-2">
          <button type="submit" className="w-full flex items-center gap-2 py-2 text-[14px] text-error hover:bg-[#FEE2E2] rounded-xl transition-colors text-left px-2 font-body font-medium">
            <LogOut size={16} /> Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
