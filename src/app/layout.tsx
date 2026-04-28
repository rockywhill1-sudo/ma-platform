import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import { getAppSettings } from '@/lib/settings';
import { getTheme, themeStyleString } from '@/lib/themes';
import './globals.css';

// Force every request to be dynamic, no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAppSettings();
  return {
    title: s.browser_title,
    description: s.platform_name + ' - investor-grade M&A intelligence',
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read headers to opt into dynamic rendering
  await headers();

  const settings = await getAppSettings();
  const theme = getTheme(settings.color_theme);
  const themeStyles = themeStyleString(theme);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inject theme as inline style with high priority */}
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased`} suppressHydrationWarning data-theme={theme.key}>
        {children}
      </body>
    </html>
  );
}
