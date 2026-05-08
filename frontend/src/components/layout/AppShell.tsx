'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ConnectionStatus } from './ConnectionStatus';
import { useAuthStore } from '@/lib/auth-store';

const NO_SHELL_ROUTES = ['/login', '/superadmin', '/superadmin/login', '/superadmin/dashboard', '/auth/callback', '/auth/completar-perfil'];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
const CHECK_INTERVAL = 15_000; // 15 seconds

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const isShellRoute = !NO_SHELL_ROUTES.some((r) => pathname === r || pathname.startsWith('/superadmin') || pathname.startsWith('/auth/'));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const verify = async () => {
    try {
      const token = localStorage.getItem('auth_token') || (() => {
        try { return JSON.parse(localStorage.getItem('porcine-auth') || '{}')?.state?.token; } catch { return null; }
      })();
      if (!token) return;

      const res = await fetch(`${API_BASE}/auth/verificar`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (res.status === 401 || res.status === 403) {
        const body = await res.json().catch(() => ({ error: 'Acceso suspendido' }));
        logout();
        localStorage.removeItem('porcine-auth');
        localStorage.removeItem('auth_token');
        const msg = encodeURIComponent(body.error || 'Tu acceso ha sido suspendido.');
        window.location.href = `/login?error=${msg}`;
      }
    } catch {
      // Network error — don't kick the user out, just wait
    }
  };

  // Verificar INMEDIATAMENTE al cambiar de sección
  useEffect(() => {
    if (!mounted || !isShellRoute || !isAuthenticated) return;
    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted, isShellRoute, isAuthenticated]);

  // Verificar también en intervalo periódico
  useEffect(() => {
    if (!mounted || !isShellRoute || !isAuthenticated) return;
    intervalRef.current = setInterval(verify, CHECK_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isShellRoute, isAuthenticated]);

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
