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
        { href: '/mahasiswa', label: 'Dashboard', icon: SquaresFour },
        { href: '/mahasiswa/submit', label: 'Submit Tiket', icon: PlusCircle },
      ]
    : [
        { href: '/admin', label: 'Dashboard', icon: SquaresFour },
        { href: '/admin/analytics', label: 'Analytics', icon: ChartBar },
        { href: '/admin/ml', label: 'Kelola ML', icon: Brain },
      ]

  const roleLabel = role.replace('_', ' ')
  const roleBadgeClass = role === 'mahasiswa'
    ? 'bg-accent/10 text-accent'
    : role === 'admin'
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-text-primary text-white'

  return (
    <aside className="w-[260px] bg-white border-r border-border h-full flex flex-col">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-1.5 bg-white rounded-xl shadow-glass border border-white/40 group-hover:scale-105 transition-transform">
            <img src="/assets/UNSAP.png" alt="UNSAP Logo" className="w-7 h-7 object-contain" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-text-primary">UNSAP</span>
        </Link>
      </div>

      <nav className="flex-1 px-5 mt-4 space-y-1.5">
        <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4 px-4 opacity-60">System Navigation</h2>
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group ${
                isActive 
                  ? 'bg-accent text-white shadow-xl shadow-accent/20' 
                  : 'text-text-secondary hover:bg-zinc-50 hover:text-text-primary'
              }`}
            >
              <Icon size={20} weight={isActive ? "fill" : "duotone"} className={isActive ? "text-white" : "text-text-muted group-hover:text-accent transition-colors"} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-5 rounded-[2rem] bg-zinc-50 border border-border relative overflow-hidden group">
          {/* Internal card glow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/5 blur-2xl rounded-full" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center shrink-0">
                <IdentificationCard size={22} weight="duotone" className="text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-text-primary truncate">{userName}</p>
                <span className={`inline-block px-2 py-0.5 mt-1 rounded-lg text-[9px] font-bold tracking-wider uppercase ${roleBadgeClass}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
            
            <form action="/api/auth/logout" method="POST" className="border-t border-zinc-200/60 pt-3">
              <button type="submit" className="w-full flex items-center gap-2.5 py-2 text-[13px] text-zinc-500 hover:text-red-600 transition-colors text-left font-bold group/btn">
                <SignOut size={18} weight="bold" className="group-hover/btn:translate-x-0.5 transition-transform" /> 
                Keluar Sesi
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  )
}
