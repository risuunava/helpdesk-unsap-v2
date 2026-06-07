"use client"

import React from 'react'
import { List } from '@phosphor-icons/react'
import { NotificationBell } from './NotificationBell'
import { Button } from '../ui/button'

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 h-20 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 border-b border-border z-40">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-text-secondary hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
          onClick={onMenuClick}
        >
          <List size={24} weight="bold" />
        </Button>
        
        <div className="hidden md:block">
           <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">Control Center</p>
           <h2 className="text-[15px] font-bold text-text-primary mt-0.5">Layanan Helpdesk <span className="italic font-serif font-normal text-text-muted">Digital</span></h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block" />
        <NotificationBell />
      </div>
    </header>
  )
}
