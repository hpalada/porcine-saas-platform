'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api-client';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { IconTrendingUp, IconTrendingDown, IconMinus, IconDownload, IconBarChart } from '@/components/icons';

const CATEGORIAS_LABEL: Record<string, string> = {
  lechon: 'Precio Lechón', trabajador: 'Trabajadores', medicina: 'Medicina',
  transporte: 'Transporte', mano_obra: 'Mano de Obra', servicios: 'Servicios', otro: 'Otro',
};

export default function ReportesPage() {
  const [loteSeleccionado, setLoteSeleccionado] = useState('');
  const { data: lotes = [] } = useSWR('/api/lotes', () => api.lotes.list());
  const { data: reporte } = useSWR(
    loteSeleccionado ? `/api/reportes/rentabilidad/${loteSeleccionado}` : null,
    () => api.reportes.rentabilidad(loteSeleccionado)
  );

  const [exportando, setExportando] = useState<'excel' | 'pdf' | null>(null);

  const handleExportar = async (formato: 'excel' | 'pdf') => {
    if (!loteSeleccionado || exportando) return;
    setExportando(formato);
    try {
      const blob = await api.reportes.exportar(loteSeleccionado, formato);
      const ext = formato === 'excel' ? 'xlsx' : 'pdf';
      const nombre = (reporte as any)?.lote?.nombre || 'reporte';
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nombre}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Error al exportar');
    } finally {
      setExportando(null);
    }
  };

  const r = reporte as any;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Reportes</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Análisis de rentabilidad por lote</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Select label="Seleccionar Lote" value={loteSeleccionado} onChange={(e) => setLoteSeleccionado(e.target.value)}>
              <option value="">Seleccione un lote...</option>
              {(lotes as any[]).map((l: any) => <option key={l._id} value={l._id}>{l.nombre}</option>)}
            </Select>
          </div>
          {loteSeleccionado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleExportar('excel')}
                disabled={!!exportando}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-md shadow-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Descargar reporte Excel"
              >
                <IconDownload size={15} />
                {exportando === 'excel' ? 'Generando...' : 'Excel'}
              </button>
              <button
                type="button"
                onClick={() => handleExportar('pdf')}
                disabled={!!exportando}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-md shadow-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Descargar reporte PDF"
              >
                <IconDownload size={15} />
                {exportando === 'pdf' ? 'Generando...' : 'PDF'}
              </button>
            </div>
          )}
        </div>
      </Card>

      {r ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div>
              <h3 className="text-xl font-bold text-white">{r.lote.nombre}</h3>
              <p className="text-sm text-zinc-400 mt-1">
                {formatNumber(r.lote.cantidadInicial)} animales iniciales · Ingresó: {formatDate(r.lote.fechaIngreso)}
              </p>
            </div>
            <Badge variant={r.resultado.estado === 'rentable' ? 'active' : r.resultado.estado === 'perdida' ? 'danger' : 'default'}>
              <div className="flex items-center gap-1.5">
                {r.resultado.estado === 'rentable' ? <IconTrendingUp size={12} /> : r.resultado.estado === 'perdida' ? <IconTrendingDown size={12} /> : <IconMinus size={12} />}
                {r.resultado.estado.toUpperCase()}
              </div>
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Ingresos Totales">
              <p className="text-3xl font-bold text-green-400 mt-1">{formatCurrency(r.ingresos.total)}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Cerdos vendidos</span><span className="text-white">{formatNumber(r.ingresos.cerdosVendidos)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Peso total</span><span className="text-white">{formatNumber(r.ingresos.pesoTotal)} kg</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Precio promedio</span><span className="text-white">{formatCurrency(r.ingresos.precioPromedio)}/kg</span></div>
              </div>
            </Card>

            <Card title="Costos Totales">
              <p className="text-3xl font-bold text-red-400 mt-1">{formatCurrency(r.costos.totales)}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Concentrado</span><span className="text-white">{formatCurrency(r.costos.concentrado.total)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Otros gastos</span><span className="text-white">{formatCurrency(r.costos.otrosGastos.total)}</span></div>
              </div>
            </Card>

            <Card title="Resultado">
              <p className={`text-3xl font-bold mt-1 ${r.resultado.utilidad >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(r.resultado.utilidad)}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Margen</span><span className="text-white">{r.resultado.margen}%</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Costo/cerdo</span><span className="text-white">{formatCurrency(r.indicadores.costoPorCerdo)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Costo/kg</span><span className="text-white">{formatCurrency(r.indicadores.costoPorKg)}</span></div>
              </div>
            </Card>
          </div>

          {Object.keys(r.costos.otrosGastos.porCategoria).length > 0 && (
            <Card title="Desglose de Gastos">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-1">
                {Object.entries(r.costos.otrosGastos.porCategoria).map(([cat, monto]) => (
                  <div key={cat} className="p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">{CATEGORIAS_LABEL[cat] || cat}</p>
                    <p className="text-base font-bold text-white mt-1">{formatCurrency(monto as number)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-16 text-zinc-400">
            <IconBarChart size={44} className="mx-auto mb-3 text-zinc-700" />
            <p>Selecciona un lote para ver el análisis de rentabilidad</p>
          </div>
        </Card>
      )}
    </div>
  );
}
