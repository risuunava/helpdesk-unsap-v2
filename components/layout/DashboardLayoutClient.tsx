"use client"

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { AnimatePresence, motion } from 'framer-motion' // Assuming framer-motion is installed

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
    <div className="flex min-h-screen bg-bg-base text-text-primary">
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

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-50`}>
        <Sidebar role={role} userName={userName} isMobileOpen={isSidebarOpen} onClose={toggleSidebar} />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
