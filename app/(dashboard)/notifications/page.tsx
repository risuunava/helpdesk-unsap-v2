import React from 'react'
import { getCurrentProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NotificationsClient from './client'

export default async function NotificationsPage() {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="p-6 md:p-10 w-full mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight mb-2 text-foreground">Pusat Notifikasi</h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Semua pemberitahuan dan pembaruan terkait pelaporan yang Anda ajukan atau tangani akan muncul di sini. Klik notifikasi untuk menandainya sebagai sudah dibaca.
        </p>
      </div>
      <NotificationsClient userId={profile.id} />
    </div>
  )
}
