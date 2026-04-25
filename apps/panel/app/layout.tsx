import type { Metadata } from 'next';
import { Archivo, Bebas_Neue, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '../lib/auth';
import './panel.css';

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Panel — opony.app',
  description: 'Panel dla firm wulkanizatorskich',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pl"
      className={`${archivo.variable} ${bebasNeue.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
