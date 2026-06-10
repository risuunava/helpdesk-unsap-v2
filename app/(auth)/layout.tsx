'use client'

import React from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground selection:bg-accent/20 selection:text-accent font-sans">
      
      {/* Left side: Editorial / Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-muted/20 border-r border-border/50 relative overflow-hidden">
        <Link href="/" className="flex items-center gap-3 z-10 w-fit">
          <img src="/assets/UNSAP.png" alt="UNSAP Logo" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-lg tracking-tight">UNSAP Helpdesk</span>
        </Link>
        
        <div className="z-10 max-w-md">
          <h1 className="text-4xl leading-tight font-medium tracking-tight mb-6">
            Infrastruktur pelaporan yang dirancang untuk kejelasan.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Sistem Layanan Terpadu Universitas Sebelas April memfasilitasi kebutuhan akademik dan operasional dengan resolusi cepat dan transparan.
          </p>
        </div>
        
        <div className="z-10 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Sistem Aktif &bull; v2.0
        </div>
        
        {/* Subtle architectural background */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
          <div className="w-[120%] aspect-square rounded-full border border-border/60 absolute left-[-20%] top-[-10%]" />
          <div className="w-[80%] aspect-square rounded-full border border-foreground/10 absolute left-[0%] top-[20%]" />
        </div>
      </div>
      
      {/* Right side: Form Container */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-24 relative">
        {/* Mobile Header */}
        <Link href="/" className="lg:hidden flex items-center gap-3 mb-16 w-fit">
          <img src="/assets/UNSAP.png" alt="UNSAP Logo" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-lg tracking-tight">UNSAP Helpdesk</span>
        </Link>
        
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>
      
    </div>
  )
}
