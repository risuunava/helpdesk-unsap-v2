'use client';

import { useKBar } from 'kbar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export function SearchInput() {
  const { query } = useKBar();
  return (
    <div className='w-full'>
      <Button
        variant='outline'
        className='bg-muted/50 text-muted-foreground relative h-9 w-full justify-start rounded-xl text-sm font-medium shadow-none sm:pr-12 md:w-40 lg:w-64 border-border/60 hover:bg-muted'
        onClick={query.toggle}
      >
        <Icons.search className='mr-2 h-4 w-4 text-accent' />
        Cari aksi...
        <kbd className='bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-6 items-center gap-1 rounded-lg border border-border/40 px-1.5 font-mono text-[10px] font-bold opacity-100 select-none sm:flex text-text-muted'>
          <span className='text-[10px]'>⌘</span>K
        </kbd>
      </Button>
    </div>
  );
}
