import React from 'react'
import { DashboardLayoutClient } from '@/components/layout/DashboardLayoutClient'
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
    <DashboardLayoutClient role={role} userName={name}>
      {children}
    </DashboardLayoutClient>
  )
}
