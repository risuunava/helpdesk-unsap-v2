import React from 'react'
import { getCurrentProfile } from '@/lib/auth'
import AppSidebar from '@/components/layout/app-sidebar'
import Header from '@/components/layout/Header'
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
        <AppSidebar role={role} userName={name} />
        <SidebarInset>
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
            <Infobar 
              side="right" 
              variant="sidebar" 
              collapsible="offcanvas" 
              className="border-l border-t border-border/40"
            >
               <div className="p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Contextual Info</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                     Panel ini memberikan informasi tambahan terkait halaman yang sedang Anda buka.
                  </p>
               </div>
            </Infobar>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </InfobarProvider>
  )
}
