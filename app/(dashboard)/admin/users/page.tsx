import React from 'react'
import PageContainer from '@/components/layout/page-container'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import ImportUsersDialog from './ImportUsersDialog'
import UserTable from './UserTable'

export default async function AdminUsersPage() {
  // Protect page and retrieve authenticated user
  const { user: currentAdmin } = await requireRole(['admin', 'master_admin'])

  const supabase = await createClient()

  // Fetch all profiles ordered by created_at desc
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Extract unique, non-empty department names dynamically
  const departments = Array.from(
    new Set(
      profiles
        ?.map((p) => p.department)
        .filter((d): d is string => !!d && d.trim() !== '') || []
    )
  ).sort()

  return (
    <PageContainer
      pageTitle="Kelola Akun Pengguna"
      pageDescription="Daftar akun pengguna terdaftar di dalam portal helpdesk UNSAP."
      pageHeaderAction={<ImportUsersDialog />}
    >
      {error ? (
        <div className="p-8 text-center text-destructive text-sm font-semibold border border-destructive/20 rounded-xl bg-destructive/5">
          Gagal memuat data pengguna: {error.message}
        </div>
      ) : (
        <UserTable
          initialProfiles={profiles || []}
          currentAdminId={currentAdmin.id}
          departments={departments}
        />
      )}
    </PageContainer>
  )
}
