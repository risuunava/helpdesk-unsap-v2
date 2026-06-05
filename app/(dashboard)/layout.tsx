import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { getCurrentProfile } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()
  const role = (profile?.role as 'mahasiswa' | 'admin' | 'master_admin') || 'mahasiswa'
  const name = profile?.full_name || 'Guest'

  return (
    <div className="flex min-h-screen bg-bg-base text-text-primary">
      <Sidebar role={role} userName={name} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
