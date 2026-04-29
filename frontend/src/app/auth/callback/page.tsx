'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full" />
        <p className="text-zinc-400 text-sm">Iniciando sesión con Google...</p>
      </div>
    </div>
  );
}

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      const msgs: Record<string, string> = {
        bloqueado: 'Tu acceso está bloqueado. Contacta al administrador.',
        inactivo: 'Tu suscripción no está activa. Contacta al administrador.',
        google: 'Error al autenticar con Google.',
      };
      router.replace(`/login?error=${encodeURIComponent(msgs[error] || 'Error de autenticación')}`);
      return;
    }

    if (!token) { router.replace('/login'); return; }

    setAuth({
      id: params.get('id') || '',
      nombre: params.get('nombre') || '',
      email: params.get('email') || '',
      rol: (params.get('rol') || 'administrador') as any,
      empresa: { id: params.get('empresaId') || '', nombre: params.get('empresaNombre') || '' },
    }, token);

    router.replace('/');
  }, [params, router, setAuth]);

  return <Spinner />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
    </Suspense>
  );
}
