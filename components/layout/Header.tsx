"use client"

import React from 'react'
import { Bell, Menu } from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import Link from 'next/link'
import { Button } from '../ui/button' // Assuming Button component is in ui folder

interface HeaderProps {
  onMenuClick?: () => void; // For mobile sidebar toggle
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 border-b border-border z-50">
      {/* Left section: Logo/Title for Desktop, Menu icon for Mobile */}
      <div className="flex items-center gap-4">
        {/* Mobile menu icon */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-text-secondary hover:text-text-primary"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </Button>
        {/* Logo/Title */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center shadow-sm">
            <span className="text-white font-serif font-bold text-[15px] leading-none">U</span>
          </div>
          <span className="font-serif font-bold text-[18px] text-text-primary">UNSAP Helpdesk</span>
        </Link>
      </div>

      {/* Right section: Notification Bell */}
      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>
    </header>
  )
}
