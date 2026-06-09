'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base relative overflow-hidden grain-texture">
      {/* Refined Background Accents */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] aspect-square bg-accent/[0.08] blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] aspect-square bg-emerald-500/[0.06] blur-[120px] rounded-full" 
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-3 mb-8 group">
            <div className="p-2 bg-card rounded-2xl shadow-glass border border-border/40 group-hover:scale-105 transition-transform">
              <img src="/assets/UNSAP.png" alt="UNSAP Logo" className="w-10 h-10 object-contain" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-text-primary">UNSAP</span>
          </Link>
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-medium text-text-primary tracking-tight">
              Portal <span className="italic text-text-muted">Helpdesk</span>
            </h1>
            <p className="font-sans text-[14px] text-text-secondary font-medium tracking-wide opacity-80 uppercase">
              Universitas Sebelas April
            </p>
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-border/40 shadow-glass relative overflow-hidden group">
          {/* Subtle card glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/5 blur-3xl rounded-full group-hover:bg-accent/10 transition-colors" />
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-text-muted">
            &copy; {new Date().getFullYear()} UNSAP Cerdas Terintegrasi
          </p>
        </div>
      </div>
    </div>
  )
}
