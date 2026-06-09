'use client';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import KBar from '../kbar';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue?: string;
  children: React.ReactNode;
}) {
  return (
    <ActiveThemeProvider initialTheme={activeThemeValue || 'supabase'}>
      <NextThemesProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
          enableColorScheme={false}
          value={{
            light: 'light',
            dark: 'dark'
          }}
      >
        <NuqsAdapter>
          <KBar>
            <QueryProvider>{children}</QueryProvider>
          </KBar>
        </NuqsAdapter>
      </NextThemesProvider>
    </ActiveThemeProvider>
  );
}
