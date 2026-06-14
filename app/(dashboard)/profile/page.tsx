'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import PageContainer from '@/components/layout/PageContainer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  Mail, 
  Building2, 
  IdCard, 
  Calendar, 
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const router = useRouter()

  const isLoading = authLoading || profileLoading

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-muted-foreground w-5 h-5" />
        </div>
      </PageContainer>
    )
  }

  if (!user || !profile) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[40vh] border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">User profile not found.</p>
        </div>
      </PageContainer>
    )
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <PageContainer pageTitle="Profile" pageDescription="Manage your academic identity and account settings.">
      <div className="max-w-3xl mx-auto w-full mt-8">
        
        <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-sm">
          {/* Header Area */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border border-border shadow-sm">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} className="object-cover" />
              <AvatarFallback className="text-2xl font-medium bg-muted text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left space-y-3 mt-1">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {profile.full_name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.role === 'mahasiswa' ? 'Mahasiswa' : profile.role.replace('_', ' ')}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                  <Building2 size={13} />
                  {profile.department || 'Fakultas / Prodi belum diatur'}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  <ShieldCheck size={13} />
                  Terverifikasi
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/settings')}
              className="mt-2 sm:mt-0 shadow-sm"
            >
              <SettingsIcon size={14} className="mr-2" />
              Pengaturan
            </Button>
          </div>

          <Separator />

          {/* Details Area */}
          <div className="p-6 sm:p-8 bg-muted/20">
            <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">Informasi Akademik</h3>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
              <ProfileItem 
                icon={<Mail size={16} />} 
                label="Email" 
                value={user.email || '-'} 
              />
              <ProfileItem 
                icon={<IdCard size={16} />} 
                label="NIM (Nomor Induk Mahasiswa)" 
                value={profile.nim || '-'} 
              />
              <ProfileItem 
                icon={<Building2 size={16} />} 
                label="Fakultas / Program Studi" 
                value={profile.department || '-'} 
              />
              <ProfileItem 
                icon={<Calendar size={16} />} 
                label="Terdaftar Sejak" 
                value={profile.created_at ? format(new Date(profile.created_at), 'dd MMMM yyyy', { locale: id }) : '-'} 
              />
            </div>
          </div>

          <Separator />

          {/* Footer Area */}
          <div className="px-6 py-4 bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground font-mono">
              ID: {profile.id}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
               <CheckCircle2 size={14} className="text-emerald-500" />
               Sistem tersinkronisasi
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  )
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  )
}

