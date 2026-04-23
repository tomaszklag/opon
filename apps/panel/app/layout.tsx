import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Provider Panel — opony.app',
  description: 'Panel for tire service providers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
