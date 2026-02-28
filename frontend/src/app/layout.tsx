import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Construction AI - Smart Intelligence Platform',
  description: 'AI-Powered Construction Intelligence Platform for Executives',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className={`${outfit.className} antialiased bg-slate-900 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
