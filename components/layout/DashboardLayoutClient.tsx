"use client"

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { AnimatePresence, motion } from 'motion/react'

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
    <div className="flex h-screen overflow-hidden bg-bg-base text-text-primary selection:bg-accent/10 selection:text-accent">
      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Using fixed/absolute for high stability in App Shell */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  md:relative md:translate-x-0 md:flex-shrink-0 transition-transform duration-200 ease-in-out z-50`}>
        <Sidebar role={role} userName={userName} isMobileOpen={isSidebarOpen} onClose={toggleSidebar} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Main Content Area with internal scroll */}
        <main className="flex-1 p-8 lg:p-12 bg-bg-base overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
