'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { api } from '@/lib/api-client';
import { IconPackage, IconAlertTriangle, IconUtensils, IconWheat, IconUser, IconArrowRight } from '@/components/icons';
import { useAuthStore } from '@/lib/auth-store';

export default function Dashboard() {
  const { usuario } = useAuthStore();
  const { data: lotes = [] } = useSWR('/api/lotes', () => api.lotes.list());
  const { data: inventario = [] } = useSWR('/api/inventario', () => api.inventario.stockActual());
  const { data: consumos = [] } = useSWR('/api/consumos?limite=5', () => api.consumos.list({ limite: '5' }));

  const loading = !lotes || !inventario;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const lotesActivos = (lotes as any[]).filter((l) => l.estado === 'activo');
  const lotesFinalizados = (lotes as any[]).filter((l) => l.estado === 'finalizado');
  const stockBajo = (inventario as any[]).filter((i) => i.stock < 10);
  const totalAnimales = lotesActivos.reduce((acc: number, l: any) => acc + (l.cantidadActual || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {usuario ? `Bienvenido, ${usuario.nombre} — ${usuario.empresa?.nombre}` : 'Resumen general de la granja'}
        </p>
      </div>

      {/* KPIs — clickeables, todos del mismo tamaño */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 auto-rows-fr">
        <Link href="/lotes" className="block h-full transition-transform hover:-translate-y-0.5">
          <StatCard title="Lotes Activos" value={lotesActivos.length} icon={<IconPackage size={22} className="text-green-500" />} />
        </Link>
        <Link href="/lotes" className="block h-full transition-transform hover:-translate-y-0.5">
          <StatCard title="Animales Activos" value={formatNumber(totalAnimales)} icon={<IconUser size={22} className="text-blue-500" />} />
        </Link>
        <Link href="/concentrados" className="block h-full transition-transform hover:-translate-y-0.5">
          <StatCard title="Tipos Concentrado" value={(inventario as any[]).length} icon={<IconWheat size={22} className="text-yellow-500" />} />
        </Link>
        <Link href="/inventario" className="block h-full transition-transform hover:-translate-y-0.5">
          <StatCard title="Stock Crítico" value={stockBajo.length} icon={<IconAlertTriangle size={22} className="text-red-500" />} />
        </Link>
      </div>

      {/* Alerta stock */}
      {stockBajo.length > 0 && (
        <Card className="border-yellow-900/40 bg-yellow-900/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IconAlertTriangle size={18} className="text-yellow-500" />
              <h3 className="text-base font-semibold text-yellow-500">Stock Bajo</h3>
            </div>
            <Link href="/inventario" className="text-xs flex items-center gap-1 hover:underline text-yellow-500">
              Ver inventario <IconArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stockBajo.map((item: any) => (
              <Link
                key={item._id}
                href="/inventario"
                className="flex items-center justify-between p-3 rounded-lg transition-colors bg-zinc-800/50 hover:bg-zinc-800"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.nombre}</p>
                  <p className="text-xs text-zinc-400">Stock actual</p>
                </div>
                <Badge variant="danger">{formatNumber(item.stock)} {item.unidad}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lotes activos */}
        <Card title="Lotes Activos" action={
          <Link href="/lotes" className="text-xs text-green-500 hover:text-green-400 flex items-center gap-1">
            Ver todos <IconArrowRight size={12} />
          </Link>
        }>
          {lotesActivos.length > 0 ? (
            <div className="space-y-2 mt-1">
              {lotesActivos.slice(0, 5).map((lote: any) => (
                <Link
                  key={lote._id}
                  href="/lotes"
                  className="flex items-center justify-between p-3 rounded-lg transition-colors bg-zinc-800/50 hover:bg-zinc-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-900/30">
                      <IconPackage size={16} className="text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-white">{lote.nombre}</p>
                      <p className="text-xs text-zinc-400">{formatDate(lote.fechaIngreso)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{formatNumber(lote.cantidadActual)}</p>
                      <p className="text-xs text-zinc-500">animales</p>
                    </div>
                    <Badge variant="active">Activo</Badge>
                  </div>
                </Link>
              ))}
              {lotesActivos.length > 5 && (
                <p className="text-xs text-center pt-1 text-zinc-500">+{lotesActivos.length - 5} más</p>
              )}
            </div>
          ) : (
            <Link href="/lotes" className="block text-sm py-4 text-center hover:underline text-zinc-400">
              No hay lotes activos — crear uno
            </Link>
          )}
        </Card>

        {/* Últimos consumos */}
        <Card title="Últimos Consumos" action={
          <Link href="/consumos" className="text-xs text-green-500 hover:text-green-400 flex items-center gap-1">
            Ver todos <IconArrowRight size={12} />
          </Link>
        }>
          {(consumos as any[]).length > 0 ? (
            <div className="space-y-2 mt-1">
              {(consumos as any[]).map((consumo: any) => (
                <Link
                  key={consumo._id}
                  href="/consumos"
                  className="flex items-center justify-between p-3 rounded-lg transition-colors bg-zinc-800/50 hover:bg-zinc-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-900/30">
                      <IconUtensils size={16} className="text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {(consumo.loteId as any)?.nombre || 'Lote eliminado'}
                      </p>
                      <p className="text-xs truncate text-zinc-400">
                        {(consumo.concentradoTipoId as any)?.nombre || 'Concentrado'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-green-400">{formatCurrency(consumo.costoTotal)}</p>
                    <p className="text-xs text-zinc-500">{formatDate(consumo.fecha)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Link href="/consumos" className="block text-sm py-4 text-center hover:underline text-zinc-400">
              No hay consumos registrados — registrar uno
            </Link>
          )}
        </Card>
      </div>

      {/* Resumen estadísticas — cards clickeables del mismo tamaño */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-fr">
        <Link href="/lotes" className="block h-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-colors hover:border-zinc-700">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Total Lotes</p>
          <p className="text-2xl font-bold mt-1 text-white">{(lotes as any[]).length}</p>
        </Link>
        <Link href="/lotes" className="block h-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-colors hover:border-zinc-700">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Finalizados</p>
          <p className="text-2xl font-bold mt-1 text-white">{lotesFinalizados.length}</p>
        </Link>
        <Link href="/lotes" className="block h-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-colors hover:border-zinc-700">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Total Animales Inicial</p>
          <p className="text-2xl font-bold mt-1 text-white">{formatNumber((lotes as any[]).reduce((a: number, l: any) => a + (l.cantidadInicial || 0), 0))}</p>
        </Link>
        <Link href="/ventas" className="block h-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-colors hover:border-zinc-700">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Salidas Totales</p>
          <p className="text-2xl font-bold mt-1 text-white">{formatNumber((lotes as any[]).reduce((a: number, l: any) => a + (l.cantidadSalida || 0), 0))}</p>
        </Link>
      </div>
    </div>
  );
}
