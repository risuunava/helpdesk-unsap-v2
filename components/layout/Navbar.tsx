'use client'
import React from 'react'
import { Menu } from 'lucide-react'

export function Navbar() {
  return (
    <header className="h-16 bg-bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 md:hidden sticky top-0 z-50 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
          <span className="text-text-inverse font-display font-bold text-[13px] leading-none">U</span>
        </div>
        <span className="font-display font-bold text-[18px] text-text-primary">UNSAP</span>
      </div>
      <button className="text-text-secondary hover:text-text-primary p-2 hover:bg-bg-elevated rounded-xl transition-all">
        <Menu size={22} />
      </button>
    </header>
  )
}
