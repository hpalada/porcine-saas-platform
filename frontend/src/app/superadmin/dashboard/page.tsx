'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperAdminStore, saFetch } from '@/lib/superadmin-store';
import { formatDate } from '@/lib/utils';

const PLAN_LABEL: Record<string, string> = { gratuito: 'Gratuito', profesional: 'Profesional', empresa: 'Empresa' };
const PLAN_COLOR: Record<string, string> = {
  gratuito: 'bg-zinc-800 text-zinc-400',
  profesional: 'bg-blue-900/30 text-blue-400',
  empresa: 'bg-violet-900/30 text-violet-400',
};

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, email, logout } = useSuperAdminStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'activos' | 'inactivos' | 'bloqueados'>('todos');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.replace('/superadmin/login'); return; }
    loadData();
  }, [mounted, isAuthenticated]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([saFetch('/superadmin/stats'), saFetch('/superadmin/clientes')]);
      setStats(s);
      setClientes(c);
    } catch {
      router.replace('/superadmin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const toggleSuscripcion = async (id: string) => {
    await saFetch(`/superadmin/clientes/${id}/suscripcion`, { method: 'PUT' });
    loadData();
  };

  const toggleAcceso = async (id: string) => {
    await saFetch(`/superadmin/clientes/${id}/acceso`, { method: 'PUT' });
    loadData();
  };

  const setPlan = async (id: string, plan: string) => {
    await saFetch(`/superadmin/clientes/${id}/plan`, { method: 'PUT', body: JSON.stringify({ plan }) });
    loadData();
  };

  const handleLogout = () => { logout(); router.replace('/superadmin/login'); };

  const clientesFiltrados = clientes.filter((c) => {
    const matchSearch = !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchFiltro =
      filtro === 'todos' ? true :
      filtro === 'activos' ? c.suscripcionActiva && !c.accesoBloqueado :
      filtro === 'inactivos' ? !c.suscripcionActiva :
      filtro === 'bloqueados' ? c.accesoBloqueado : true;
    return matchSearch && matchFiltro;
  });

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-700 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <div>
              <h1 className="text-base font-bold">Porcine SaaS — Admin</h1>
              <p className="text-xs text-zinc-500">{email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-900/10">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Clientes', value: stats.total, color: 'text-white' },
              { label: 'Suscripciones Activas', value: stats.activas, color: 'text-green-400' },
              { label: 'Sin Suscripción', value: stats.inactivas, color: 'text-zinc-400' },
              { label: 'Acceso Bloqueado', value: stats.bloqueadas, color: 'text-red-400' },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">{s.label}</p>
                <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-600"
          />
          <div className="flex gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg flex-shrink-0">
            {(['todos', 'activos', 'inactivos', 'bloqueados'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${filtro === f ? 'bg-violet-700 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla clientes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-5 py-3 text-left text-xs text-zinc-500 uppercase tracking-wide">Empresa</th>
                  <th className="px-5 py-3 text-left text-xs text-zinc-500 uppercase tracking-wide hidden md:table-cell">Registrado</th>
                  <th className="px-5 py-3 text-center text-xs text-zinc-500 uppercase tracking-wide">Plan</th>
                  <th className="px-5 py-3 text-center text-xs text-zinc-500 uppercase tracking-wide">Suscripción</th>
                  <th className="px-5 py-3 text-center text-xs text-zinc-500 uppercase tracking-wide">Acceso</th>
                  <th className="px-5 py-3 text-right text-xs text-zinc-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-zinc-500">No hay clientes</td></tr>
                ) : clientesFiltrados.map((c) => (
                  <tr key={c._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-white">{c.nombre}</p>
                        <p className="text-xs text-zinc-500">{c.email}</p>
                        {c.ubicacion && <p className="text-xs text-zinc-600">{c.ubicacion}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-zinc-400">{formatDate(c.createdAt)}</td>
                    <td className="px-5 py-4 text-center">
                      <select
                        value={c.plan}
                        onChange={(e) => setPlan(c._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${PLAN_COLOR[c.plan]} bg-transparent outline-none`}
                        style={{ backgroundImage: 'none' }}
                      >
                        <option value="gratuito">Gratuito</option>
                        <option value="profesional">Profesional</option>
                        <option value="empresa">Empresa</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleSuscripcion(c._id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${c.suscripcionActiva ? 'bg-green-600' : 'bg-zinc-700'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${c.suscripcionActiva ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleAcceso(c._id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${c.accesoBloqueado ? 'bg-red-600' : 'bg-zinc-700'}`}
                        title={c.accesoBloqueado ? 'Bloqueado — click para desbloquear' : 'Activo — click para bloquear'}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${c.accesoBloqueado ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.suscripcionActiva && !c.accesoBloqueado ? 'bg-green-900/30 text-green-400' : c.accesoBloqueado ? 'bg-red-900/30 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                          {c.accesoBloqueado ? 'Bloqueado' : c.suscripcionActiva ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-700">{clientesFiltrados.length} de {clientes.length} clientes</p>
      </main>
    </div>
  );
}
