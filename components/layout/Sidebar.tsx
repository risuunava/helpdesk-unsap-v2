import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, BarChart3, Brain, LogOut } from 'lucide-react'

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
    ? 'bg-emerald-100 text-emerald-700'
    : role === 'admin'
    ? 'bg-teal-100 text-teal-700'
    : 'bg-text-primary text-text-inverse'

  return (
    <aside className="w-[240px] bg-bg-elevated border-r border-border min-h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center shadow-sm">
            <span className="text-white font-serif font-bold text-[15px] leading-none">U</span>
          </div>
          <span className="font-serif font-bold text-[18px] text-text-primary">UNSAP</span>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        <h2 className="text-[11px] font-sans font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">Menu</h2>
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-sans font-medium transition-all ${
                isActive 
                  ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-900/20' 
                  : 'text-text-secondary hover:bg-emerald-50 hover:text-emerald-900'
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
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <span className="font-serif font-bold text-[14px] text-emerald-800">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-sans font-medium text-text-primary truncate">{userName}</p>
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
