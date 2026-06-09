import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: 'UNSAP Helpdesk — Smart Campus',
  description: 'Platform pelaporan keluhan mahasiswa Universitas Sebelas April'
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: META_THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: META_THEME_COLORS.dark }
  ]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  return (
    <html lang='en' suppressHydrationWarning data-theme={themeToApply}>
      <head />
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
        suppressHydrationWarning
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <Providers activeThemeValue={themeToApply}>
            <Toaster />
            {children}
        </Providers>
      </body>
    </html>
  );
}
