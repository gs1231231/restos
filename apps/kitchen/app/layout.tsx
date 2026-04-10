import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RestOS — Kitchen Display',
  description: 'Kitchen Display System for RestOS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#111' }}>
        {children}
      </body>
    </html>
  );
}
