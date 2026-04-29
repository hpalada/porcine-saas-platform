'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PigLogo } from '@/components/icons';

function CompletarPerfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ nombreEmpresa: '', ubicacion: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState({ email: '', nombre: '' });

  const tempToken = searchParams.get('tempToken');
  const email = searchParams.get('email');
  const nombre = searchParams.get('nombre');

  useEffect(() => {
    if (!tempToken) {
      setError('Token no válido. Por favor intenta nuevamente.');
      return;
    }
    setInfo({ email: decodeURIComponent(email || ''), nombre: decodeURIComponent(nombre || '') });
  }, [tempToken, email, nombre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.nombreEmpresa.trim()) {
      setError('El nombre de la empresa es requerido');
      setLoading(false);
      return;
    }

    if (!form.ubicacion.trim()) {
      setError('La ubicación es requerida');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/completar-perfil-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          nombreEmpresa: form.nombreEmpresa,
          ubicacion: form.ubicacion,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al completar el perfil');

      setAuth(data.usuario, data.token);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
        <div className="w-full max-w-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-4 shadow-lg">
                <PigLogo size={32} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Error</h1>
            </div>
            <p className="text-red-400 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-4 shadow-lg">
              <PigLogo size={32} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Completa tu Perfil</h1>
            <p className="text-xs text-zinc-500 mt-1">Información de tu empresa</p>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-zinc-400">
              <span className="text-zinc-300">Registrando:</span> <strong className="text-white">{info.nombre}</strong>
            </p>
            <p className="text-sm text-zinc-400">
              <span className="text-zinc-300">Email:</span> <strong className="text-white">{info.email}</strong>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/20 border border-red-800 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre de la Empresa"
              name="nombreEmpresa"
              type="text"
              value={form.nombreEmpresa}
              onChange={(e) => setForm({ ...form, nombreEmpresa: e.target.value })}
              placeholder="ej: Granja Santos"
              required
            />
            <Input
              label="Ubicación (Requerida)"
              name="ubicacion"
              type="text"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              placeholder="ej: Tegucigalpa, Honduras"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Creando...
                </span>
              ) : (
                'Completar Registro'
              )}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-zinc-700 mt-4">
          Classified Cloud &copy; {new Date().getFullYear()} — Gestión Empresarial
        </p>
      </div>
    </div>
  );
}

export default function CompletarPerfilPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    }>
      <CompletarPerfilForm />
    </Suspense>
  );
}
