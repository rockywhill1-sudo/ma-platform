import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { getAppSettings } from '@/lib/settings';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAppSettings();
  return {
    title: s.browser_title,
    description: s.platform_name + ' - investor-grade M&A intelligence',
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
