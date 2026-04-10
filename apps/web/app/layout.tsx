import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RestOS — Restaurant Management",
  description: "Multi-tenant Restaurant Management SaaS Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
