import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { ThemeSelector } from '../themes/theme-selector';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { NotificationBell } from './NotificationBell';
import { UserNav } from './user-nav';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className='bg-background/60 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 backdrop-blur-md md:h-14'>
      <div className='flex items-center gap-2 px-4'>
        <div className="md:hidden mr-2">
          <img src="/assets/UNSAP.png" alt="UNSAP Logo" className="w-8 h-8 object-contain" />
        </div>
        <SidebarTrigger className='-ml-1 hidden md:inline-flex' onClick={onMenuClick} />
        <Separator orientation='vertical' className='mr-2 h-4 hidden md:block' />
        <Breadcrumbs />
      </div>

      <div className='flex items-center gap-2 px-4'>
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
        <ThemeModeToggle />
        <div className='hidden sm:block'>
          <ThemeSelector />
        </div>
        <div className="flex items-center gap-3 ml-2 border-l pl-3 border-border/50">
          <NotificationBell />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
