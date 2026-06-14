import React from 'react'
import { getCurrentProfile } from '@/lib/auth'
import AppSidebar from '@/components/layout/app-sidebar'
import Header from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cookies } from 'next/headers'
import { InfobarProvider, Infobar } from '@/components/ui/infobar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()
  const role = (profile?.role as 'mahasiswa' | 'admin' | 'master_admin') || 'mahasiswa'
  const name = profile?.full_name || 'Guest'
  
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <InfobarProvider defaultOpen={false}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar role={role} userName={name} avatarUrl={profile?.avatar_url} />
        <SidebarInset className="relative">
          <Header />
          <div className="flex flex-1 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
              {children}
            </div>
            <Infobar 
              side="right" 
              variant="sidebar" 
              collapsible="offcanvas" 
              className="border-l border-t border-border/40 hidden lg:flex"
            >
               <div className="p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Contextual Info</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                     Panel ini memberikan informasi tambahan terkait halaman yang sedang Anda buka.
                  </p>
               </div>
            </Infobar>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <BottomNav role={role} />
        </SidebarInset>
      </SidebarProvider>
    </InfobarProvider>
  )
}
