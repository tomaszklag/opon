import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'opony.app — wymiana opon w Nowym Sączu',
  description: 'Zamów wymianę opon online. Szybko, wygodnie, w Twoim mieście.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
