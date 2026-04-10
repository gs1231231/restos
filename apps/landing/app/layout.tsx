import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RestOS — Restaurant Management Platform',
  description: 'Complete SaaS platform for restaurant operations, POS, billing, inventory, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
