import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Indodax Pro Trader',
  description: 'Bot trading otomatis untuk Indodax',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
