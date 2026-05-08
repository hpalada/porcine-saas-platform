'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { api } from '@/lib/api-client';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { IconTrendingUp, IconTrendingDown, IconMinus, IconDownload, IconBarChart, IconSyringe, IconSkull, IconAlertTriangle } from '@/components/icons';

export default function ReportesPage() {
  const [loteSeleccionado, setLoteSeleccionado] = useState('');
  const [exportando, setExportando] = useState<'excel' | 'pdf' | null>(null);

  const { data: lotes = [] } = useSWR('/api/lotes', () => api.lotes.list());

  const {
    data: reporte,
    error: reporteError,
    isValidating,
  } = useSWR(
    loteSeleccionado ? `/api/reportes/resumen-completo/${loteSeleccionado}` : null,
    () => api.reportes.resumenCompleto(loteSeleccionado),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const r = reporte as any;

  const totalCostos = r ? Math.round((
    (r.costos?.consumosAlimento?.total || 0) +
    (r.costos?.vacunas?.total || 0) +
    (r.costos?.otrosConsumosDetalle?.total || 0) +
    (r.costos?.gastosAdicionales?.total || 0)
  ) * 100) / 100 : 0;

  const totalIngresos = r?.ingresos?.total || 0;
  const utilidad = Math.round((totalIngresos - totalCostos) * 100) / 100;
  const margen = totalIngresos > 0 ? ((utilidad / totalIngresos) * 100).toFixed(2) : '0.00';

  const handleExportar = async (formato: 'excel' | 'pdf') => {
    if (!loteSeleccionado || exportando) return;
    setExportando(formato);
    try {
      const blob = await api.reportes.exportar(loteSeleccionado, formato);
      const ext = formato === 'excel' ? 'xlsx' : 'pdf';
      const nombre = r?.lote?.nombre || 'reporte';
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

  const renderContenido = () => {
    if (!loteSeleccionado) {
      return (
        <Card>
          <div className="text-center py-16 text-zinc-400">
            <IconBarChart size={44} className="mx-auto mb-3 text-zinc-700" />
            <p>Selecciona un lote para ver el análisis completo</p>
          </div>
        </Card>
      );
    }

    if (isValidating && !r) {
      return (
        <Card>
          <div className="flex items-center justify-center py-16 gap-3 text-zinc-400">
            <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full" />
            <span>Cargando reporte...</span>
          </div>
        </Card>
      );
    }

    if (reporteError) {
      return (
        <Card>
          <div className="text-center py-12">
            <IconAlertTriangle size={36} className="mx-auto mb-3 text-red-500" />
            <p className="font-semibold text-red-400">No se pudo cargar el reporte</p>
            <p className="text-sm mt-1 text-zinc-500">{reporteError?.message || 'Error desconocido'}</p>
          </div>
        </Card>
      );
    }

    if (!r || !r.lote) {
      return (
        <Card>
          <div className="text-center py-12 text-zinc-400">
            <IconBarChart size={36} className="mx-auto mb-3 text-zinc-700" />
            <p>No se encontraron datos para este lote</p>
          </div>
        </Card>
      );
    }

    return (
      <>
        {/* Header lote */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div>
            <h3 className="text-xl font-bold text-white">{r.lote.nombre}</h3>
            <p className="text-sm text-zinc-400 mt-1">
              {formatNumber(r.lote.cantidadInicial)} animales iniciales · Ingresó: {formatDate(r.lote.fechaIngreso)}
            </p>
          </div>
          <Badge variant={utilidad > 0 ? 'active' : utilidad < 0 ? 'danger' : 'default'}>
            <div className="flex items-center gap-1.5">
              {utilidad > 0 ? <IconTrendingUp size={12} /> : utilidad < 0 ? <IconTrendingDown size={12} /> : <IconMinus size={12} />}
              {utilidad > 0 ? 'RENTABLE' : utilidad < 0 ? 'PÉRDIDA' : 'EQUILIBRIO'}
            </div>
          </Badge>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Ingresos Totales">
            <p className="text-3xl font-bold text-green-400 mt-1">{formatCurrency(totalIngresos)}</p>
            <p className="text-xs text-zinc-500 mt-2">{r.ingresos?.registros || 0} venta(s)</p>
          </Card>

          <Card title="Costos Totales">
            <p className="text-3xl font-bold text-red-400 mt-1">{formatCurrency(totalCostos)}</p>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Alimento</span><span className="text-white">{formatCurrency(r.costos?.consumosAlimento?.total || 0)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Vacunas</span><span className="text-white">{formatCurrency(r.costos?.vacunas?.total || 0)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Otros consumos</span><span className="text-white">{formatCurrency(r.costos?.otrosConsumosDetalle?.total || 0)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Gastos adicionales</span><span className="text-white">{formatCurrency(r.costos?.gastosAdicionales?.total || 0)}</span></div>
            </div>
          </Card>

          <Card title="Resultado">
            <p className={`text-3xl font-bold mt-1 ${utilidad >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(utilidad)}
            </p>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Margen</span><span className="text-white">{margen}%</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Animales actuales</span><span className="text-white">{formatNumber(r.lote?.cantidadActual || 0)}</span></div>
            </div>
          </Card>
        </div>

        {/* Vacunaciones */}
        <Card title={`Vacunaciones (${r.costos?.vacunas?.registros || 0})`}>
          {r.costos?.vacunas?.items?.length > 0 ? (
            <>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Vacuna</TableHead>
                      <TableHead align="center">Cantidad Aplicada</TableHead>
                      <TableHead align="right">Precio Unitario</TableHead>
                      <TableHead align="right">Costo Total</TableHead>
                    </TableRow>
                  </thead>
                  <TableBody>
                    {r.costos.vacunas.items.map((v: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-zinc-300 text-sm">{v.fecha}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <IconSyringe size={12} className="text-blue-400 flex-shrink-0" />
                            <span className="text-zinc-200 text-sm">{v.vacuna}</span>
                          </div>
                        </TableCell>
                        <TableCell align="center" className="text-zinc-300 text-sm font-medium">{v.cantidadAplicada}</TableCell>
                        <TableCell align="right" className="text-zinc-300 text-sm">{formatCurrency(v.precioUnitario)}</TableCell>
                        <TableCell align="right" className="text-green-400 text-sm font-semibold">{formatCurrency(v.costoTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between text-sm">
                <span className="text-zinc-400">Total Vacunas:</span>
                <span className="font-semibold text-green-400">{formatCurrency(r.costos.vacunas.total)}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400 py-4">No hay registros de vacunaciones</p>
          )}
        </Card>

        {/* Mortalidades */}
        <Card title={`Mortalidades (${r.mortalidad?.registros || 0})`}>
          {r.mortalidad?.items?.length > 0 ? (
            <>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead align="center">Cantidad</TableHead>
                      <TableHead>Causa/Motivo</TableHead>
                    </TableRow>
                  </thead>
                  <TableBody>
                    {r.mortalidad.items.map((m: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-zinc-300 text-sm">{m.fecha}</TableCell>
                        <TableCell align="center">
                          <span className="font-semibold text-red-400">{m.cantidad}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <IconSkull size={12} className="text-red-400 flex-shrink-0" />
                            <span className="text-zinc-200 text-sm">{m.motivo}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Muertas:</span>
                  <span className="font-semibold text-red-400">{r.mortalidad.totalMuertas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tasa de Mortalidad:</span>
                  <span className="font-semibold text-red-400">{r.mortalidad.tasaMortalidad}%</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400 py-4">No hay registros de mortalidades</p>
          )}
        </Card>
      </>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Reportes</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Análisis completo por lote</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Select
              label="Seleccionar Lote"
              value={loteSeleccionado}
              onChange={(e) => setLoteSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un lote...</option>
              {(lotes as any[]).map((l: any) => (
                <option key={l._id} value={l._id}>{l.nombre}</option>
              ))}
            </Select>
          </div>
          {loteSeleccionado && r?.lote && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleExportar('excel')}
                disabled={!!exportando}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-md shadow-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconDownload size={15} />
                {exportando === 'excel' ? 'Generando...' : 'Excel'}
              </button>
              <button
                type="button"
                onClick={() => handleExportar('pdf')}
                disabled={!!exportando}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-md shadow-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconDownload size={15} />
                {exportando === 'pdf' ? 'Generando...' : 'PDF'}
              </button>
            </div>
          )}
        </div>
      </Card>

      {renderContenido()}
    </div>
  );
}
