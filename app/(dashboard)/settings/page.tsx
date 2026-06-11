'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import PageContainer from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Loader2, 
  User, 
  Lock, 
  Save, 
  ChevronRight,
  Shield,
  Bell,
  Palette
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type SettingsSection = 'profile' | 'security' | 'notifications' | 'appearance'

export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const supabase = createClient()
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    nim: ''
  })

  const [securityData, setSecurityData] = useState({
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        department: profile.department || '',
        nim: profile.nim || ''
      })
    }
  }, [profile])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          department: formData.department,
          nim: profile?.role === 'mahasiswa' ? formData.nim : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Settings updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (securityData.password !== securityData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: securityData.password })
      if (error) throw error
      toast.success('Password updated')
      setSecurityData({ password: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsSaving(false)
    }
  }

  if (profileLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
        </div>
      </PageContainer>
    )
  }

  const navItems = [
    { id: 'profile', label: 'General', icon: User, description: 'Personal information and account details' },
    { id: 'security', label: 'Security', icon: Lock, description: 'Password and authentication settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Manage how you receive alerts' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Customize the look and feel' },
  ]

  return (
    <PageContainer pageTitle="Settings" pageDescription="Manage your workspace preferences and security.">
      <div className="flex flex-col md:flex-row gap-12 mt-4">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingsSection)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    isActive 
                      ? "bg-primary/5 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.label}
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-2xl">
          {activeSection === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold tracking-tight">Personal Information</h3>
                  <p className="text-sm text-muted-foreground">Update your details and how you appear in the system.</p>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-[13px] font-medium opacity-80">Full Name</Label>
                      <Input 
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="bg-background/50 focus-visible:ring-offset-0 border-border/60"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[13px] font-medium opacity-80">Email Address</Label>
                      <Input 
                        id="email"
                        value={user?.email}
                        disabled
                        className="bg-muted/30 border-border/40 text-muted-foreground cursor-not-allowed opacity-70"
                      />
                      <p className="text-[11px] text-muted-foreground pl-1">Contact admin to change your primary email.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-[13px] font-medium opacity-80">Department</Label>
                        <Input 
                          id="department"
                          value={formData.department}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          className="bg-background/50 border-border/60"
                        />
                      </div>

                      {profile?.role === 'mahasiswa' && (
                        <div className="space-y-2">
                          <Label htmlFor="nim" className="text-[13px] font-medium opacity-80">NIM</Label>
                          <Input 
                            id="nim"
                            value={formData.nim}
                            onChange={(e) => setFormData({...formData, nim: e.target.value})}
                            className="bg-background/50 border-border/60"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="px-6 h-10 font-semibold shadow-sm"
                    >
                      {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </section>

              <div className="h-px bg-border/40" />

              <section>
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                   <h4 className="text-sm font-bold text-destructive flex items-center gap-2">
                      <Shield size={14} /> Danger Zone
                   </h4>
                   <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                   </p>
                   <Button variant="destructive" size="sm" className="font-bold">
                      Delete Account
                   </Button>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold tracking-tight">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage your password and protect your account.</p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <Label htmlFor="pass" className="text-[13px] font-medium opacity-80">New Password</Label>
                      <Input 
                        id="pass"
                        type="password"
                        value={securityData.password}
                        onChange={(e) => setSecurityData({...securityData, password: e.target.value})}
                        className="bg-background/50 border-border/60"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm" className="text-[13px] font-medium opacity-80">Confirm New Password</Label>
                      <Input 
                        id="confirm"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        className="bg-background/50 border-border/60"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="px-6 h-10 font-semibold shadow-sm"
                    >
                      {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
                      Update Password
                    </Button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl opacity-60">
               <Bell size={32} className="text-muted-foreground mb-4" />
               <h3 className="text-sm font-bold">Coming Soon</h3>
               <p className="text-xs text-muted-foreground mt-1">Notification preferences are under development.</p>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl opacity-60">
               <Palette size={32} className="text-muted-foreground mb-4" />
               <h3 className="text-sm font-bold">Coming Soon</h3>
               <p className="text-xs text-muted-foreground mt-1">Theme customization is coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </PageContainer>
  )
}
