import type { Metadata } from 'next';
import { Fraunces, Work_Sans, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'EJC Despertar',
  description: 'Portal de encontros, inscrições e comunidade do EJC Despertar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${workSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
