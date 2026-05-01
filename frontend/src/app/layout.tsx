import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SWRProvider } from '@/components/providers/SWRProvider';

export const metadata: Metadata = {
  title: 'Porcine SaaS — Gestión de Granja Porcina',
  description: 'Sistema de control de costos y producción para granjas porcinas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('porcine-theme');var t=s?JSON.parse(s).state.theme:'dark';document.documentElement.classList.add(t==='light'?'light':'dark');}catch(e){document.documentElement.classList.add('dark');}})()` }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <SWRProvider>
            <AppShell>{children}</AppShell>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
