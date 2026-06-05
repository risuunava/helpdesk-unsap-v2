import React from 'react'
import Link from 'next/link'
import { Brain } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-100/40 blur-[100px] mix-blend-multiply" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-teal-100/40 blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center group-hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-900/20">
              <span className="text-[18px] font-bold text-white">U</span>
            </div>
          </Link>
          <h1 className="font-serif text-[28px] font-medium text-text-primary text-center">
            Helpdesk <span className="italic text-emerald-700">Kampus</span>
          </h1>
          <p className="font-sans text-[15px] text-text-secondary mt-2 text-center">
            Portal pengaduan & layanan mahasiswa
          </p>
        </div>

        <div className="bg-bg-surface p-8 rounded-3xl border border-border shadow-capsule">
          {children}
        </div>
      </div>
    </div>
  )
}
