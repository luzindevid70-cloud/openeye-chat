import './globals.css'; import { Providers } from './providers'; import { Inter } from 'next/font/google'; import type { Metadata } from 'next';
const inter = Inter({ subsets: ['latin', 'cyrillic'] });
export const metadata: Metadata = { title: 'openEye Chat', description: 'ChatGPT clone', manifest: '/manifest.json', themeColor: '#202123', appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'openEye' } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ru" className={inter.className}><body><Providers>{children}</Providers></body></html>; }
