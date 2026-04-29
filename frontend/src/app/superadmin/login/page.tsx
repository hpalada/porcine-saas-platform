'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperAdminStore } from '@/lib/superadmin-store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PigLogo } from '@/components/icons';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useSuperAdminStore();
  const [form, setForm] = useState({ email: '', contraseña: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al autenticar');
      setAuth(data.token, data.email);
      router.push('/superadmin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-4 shadow-lg">
              <PigLogo size={32} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Panel Administrativo</h1>
            <p className="text-xs text-zinc-500 mt-1">Acceso restringido</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/20 border border-red-800 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@porcinesaas.com"
              required
            />
            <Input
              label="Contraseña"
              name="contraseña"
              type="password"
              value={form.contraseña}
              onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
              placeholder="••••••••"
              required
            />
            <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Verificando...
                </span>
              ) : 'Entrar al Panel'}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-zinc-700 mt-4">Porcine SaaS &copy; {new Date().getFullYear()} — Acceso privado</p>
      </div>
    </div>
  );
}
