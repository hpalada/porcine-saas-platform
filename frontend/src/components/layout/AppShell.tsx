'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ConnectionStatus } from './ConnectionStatus';
import { useAuthStore } from '@/lib/auth-store';

const NO_SHELL_ROUTES = ['/login', '/superadmin', '/superadmin/login', '/superadmin/dashboard', '/auth/callback', '/auth/completar-perfil'];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const isShellRoute = !NO_SHELL_ROUTES.some((r) => pathname === r || pathname.startsWith('/superadmin') || pathname.startsWith('/auth/'));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isShellRoute && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, isShellRoute, router]);

  if (!isShellRoute) {
    return <><ConnectionStatus />{children}</>;
  }

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header />
        <main className="flex-1">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <ConnectionStatus />
    </div>
  );
}
