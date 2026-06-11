"use client"

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import Header from './Header'
import { BottomNav } from './BottomNav'
import { AnimatePresence, motion } from 'motion/react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import KBar from '@/components/kbar'
import { InfobarProvider, InfobarInset, Infobar } from '@/components/ui/infobar'

interface DashboardLayoutClientProps {
  role: 'mahasiswa' | 'admin' | 'master_admin';
  userName: string;
  children: React.ReactNode;
}

export function DashboardLayoutClient({ role, userName, children }: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <KBar>
      <InfobarProvider defaultOpen={false}>
        <div className="flex h-screen overflow-hidden bg-bg-base text-text-primary selection:bg-accent/10 selection:text-accent">
          {/* Sidebar - Desktop Only */}
          <div className="hidden md:flex md:relative md:flex-shrink-0 z-50">
            <Sidebar role={role} userName={userName} />
          </div>

          <InfobarInset className="flex-1 flex flex-col min-w-0 h-full relative">
            {/* Header */}
            <Header onMenuClick={toggleSidebar} />

            {/* Main Content Area with internal scroll */}
            <main className="flex-1 p-6 pb-28 md:pb-6 lg:p-8 bg-bg-base overflow-y-auto scroll-smooth">
              <div className="max-w-7xl mx-auto min-h-full">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>
          </InfobarInset>

          {/* Bottom Navigation for Mobile - Moved outside Inset for better visibility */}
          <BottomNav role={role} />
          
          <Infobar side="right" variant="sidebar" collapsible="offcanvas" className="border-l border-t border-border/40">
             <div className="p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Contextual Info</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                   Panel ini memberikan informasi tambahan terkait halaman yang sedang Anda buka.
                </p>
             </div>
          </Infobar>
        </div>
      </InfobarProvider>
    </KBar>
  )
}
