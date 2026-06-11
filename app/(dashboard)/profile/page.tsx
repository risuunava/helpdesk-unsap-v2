'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import PageContainer from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  MapPin
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
          <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
        </div>
      </PageContainer>
    )
  }

  if (!user || !profile) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[40vh] border border-dashed rounded-xl">
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
    <PageContainer pageTitle="Profile" pageDescription="Overview of your personal and institutional information.">
      <div className="max-w-3xl mx-auto w-full space-y-6 mt-4">
        <Card className="border-border/40 shadow-sm overflow-hidden bg-background">
          {/* Header Section */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <Avatar className="h-28 w-28 rounded-2xl border bg-muted shadow-sm">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} />
                <AvatarFallback className="text-3xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left space-y-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h2 className="text-2xl font-bold tracking-tight">{profile.full_name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider w-fit mx-auto md:mx-0 border border-primary/20">
                    {profile.role.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                  <Building2 size={14} className="opacity-70" />
                  {profile.department || 'No department assigned'}
                </p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-[13px] text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar size={14} className="opacity-70" />
                    Joined {profile.created_at ? format(new Date(profile.created_at), 'MMMM yyyy', { locale: id }) : '-'}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-500">
                    <ShieldCheck size={14} />
                    Verified Account
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                className="rounded-lg font-semibold h-9 px-4 border-border/60 hover:bg-muted transition-colors gap-2"
                onClick={() => router.push('/settings')}
              >
                <SettingsIcon size={14} />
                Manage Account
              </Button>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Details Section */}
          <CardContent className="px-8 py-8">
            <div className="grid gap-y-8 gap-x-12 sm:grid-cols-2">
              <ProfileItem 
                icon={<Mail size={16} />} 
                label="Primary Email" 
                value={user.email || '-'} 
              />
              <ProfileItem 
                icon={<IdCard size={16} />} 
                label="Student ID (NIM)" 
                value={profile.nim || 'Not set'} 
              />
              <ProfileItem 
                icon={<Building2 size={16} />} 
                label="Faculty / Unit" 
                value={profile.department || 'Not set'} 
              />
              <ProfileItem 
                icon={<Calendar size={16} />} 
                label="Last Updated" 
                value={profile.updated_at ? format(new Date(profile.updated_at), 'dd MMM yyyy') : 'N/A'} 
              />
            </div>
          </CardContent>

          <div className="px-8 py-4 bg-muted/30 border-t border-border/40 flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              System Integrated ID: {profile.id.slice(0, 8).toUpperCase()}
            </p>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
               <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Synchronized</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center gap-2 text-muted-foreground transition-colors group-hover:text-primary/70">
        <span className="opacity-70">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground truncate pl-6">
        {value}
      </p>
    </div>
  )
}
