'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { api } from '@/lib/api-client';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { IconTrendingUp, IconTrendingDown, IconMinus, IconDownload, IconBarChart, IconSyringe, IconSkull, IconAlertTriangle, IconCalendar } from '@/components/icons';

export default function ReportesPage() {
  const [modo, setModo] = useState<'lote' | 'fecha'>('lote');
  const [loteSeleccionado, setLoteSeleccionado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [exportando, setExportando] = useState<'excel' | 'pdf' | null>(null);

  const { data: lotes = [] } = useSWR('/api/lotes', () => api.lotes.list());

  const {
    data: reporte,
    error: reporteError,
    isValidating,
  } = useSWR(
    loteSeleccionado && modo === 'lote' ? `/api/reportes/resumen-completo/${loteSeleccionado}` : null,
    () => api.reportes.resumenCompleto(loteSeleccionado),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const swrKeyFecha = modo === 'fecha' && (fechaDesde || fechaHasta)
    ? `/api/reportes/por-fecha?desde=${fechaDesde}&hasta=${fechaHasta}`
    : null;

  const {
    data: reporteFecha,
    error: reporteFechaError,
    isValidating: isValidatingFecha,
  } = useSWR(
    swrKeyFecha,
    () => api.reportes.porFecha({ fechaDesde: fechaDesde || undefined, fechaHasta: fechaHasta || undefined }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const r = reporte as any;
  const rf = reporteFecha as any;

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

  const renderLoteDetalle = () => {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div>
            <h3 className="text-xl font-bold text-white">{r.lote.nombre}</h3>
            <p className="text-sm text-zinc-400 mt-1">
              {formatNumber(r.lote.cantidadInicial)} animales iniciales · Ingresó: {formatDate(r.lote.fechaIngreso)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={r.lote.estado === 'activo' ? 'active' : 'finalizado'}>
              {r.lote.estado === 'activo' ? 'Activo' : 'Finalizado'}
            </Badge>
            <Badge variant={utilidad > 0 ? 'active' : utilidad < 0 ? 'danger' : 'default'}>
              <div className="flex items-center gap-1.5">
                {utilidad > 0 ? <IconTrendingUp size={12} /> : utilidad < 0 ? <IconTrendingDown size={12} /> : <IconMinus size={12} />}
                {utilidad > 0 ? 'RENTABLE' : utilidad < 0 ? 'PERDIDA' : 'EQUILIBRIO'}
              </div>
            </Badge>
          </div>
        </div>

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

  const renderPorFecha = () => {
    if (!fechaDesde && !fechaHasta) {
      return (
        <Card>
          <div className="text-center py-16 text-zinc-400">
            <IconCalendar size={44} className="mx-auto mb-3 text-zinc-700" />
            <p>Ingresa un rango de fechas para ver el reporte</p>
          </div>
        </Card>
      );
    }

    if (isValidatingFecha && !rf) {
      return (
        <Card>
          <div className="flex items-center justify-center py-16 gap-3 text-zinc-400">
            <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full" />
            <span>Cargando reporte...</span>
          </div>
        </Card>
      );
    }

    if (reporteFechaError) {
      return (
        <Card>
          <div className="text-center py-12">
            <IconAlertTriangle size={36} className="mx-auto mb-3 text-red-500" />
            <p className="font-semibold text-red-400">No se pudo cargar el reporte</p>
          </div>
        </Card>
      );
    }

    if (!rf || !rf.lotes?.length) {
      return (
        <Card>
          <div className="text-center py-12 text-zinc-400">
            <IconBarChart size={36} className="mx-auto mb-3 text-zinc-700" />
            <p>No hay actividad en el periodo seleccionado</p>
          </div>
        </Card>
      );
    }

    return (
      <>
        {/* Totales del periodo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Ingresos periodo</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(rf.totales.ingresos)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Costos periodo</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(rf.totales.costos)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Utilidad</p>
            <p className={`text-2xl font-bold mt-1 ${rf.totales.utilidad >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(rf.totales.utilidad)}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Mortalidades</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{rf.totales.mortalidades}</p>
          </div>
        </div>

        {/* Detalle por lote */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
            {rf.lotes.length} lote{rf.lotes.length !== 1 ? 's' : ''} con actividad en el periodo
          </h3>
          {rf.lotes.map((item: any) => {
            const ut = item.utilidad;
            return (
              <Card key={item.lote._id}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-white">{item.lote.nombre}</h4>
                      <Badge variant={item.lote.estado === 'activo' ? 'active' : 'finalizado'}>
                        {item.lote.estado === 'activo' ? 'Activo' : 'Finalizado'}
                      </Badge>
                      <Badge variant={ut > 0 ? 'active' : ut < 0 ? 'danger' : 'default'}>
                        <div className="flex items-center gap-1">
                          {ut > 0 ? <IconTrendingUp size={11} /> : ut < 0 ? <IconTrendingDown size={11} /> : <IconMinus size={11} />}
                          {ut > 0 ? 'RENTABLE' : ut < 0 ? 'PERDIDA' : 'EQUILIBRIO'}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Ingresó: {formatDate(item.lote.fechaIngreso)} · {formatNumber(item.lote.cantidadInicial)} iniciales · {formatNumber(item.lote.cantidadActual)} actuales
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${ut >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(ut)}</p>
                    <p className="text-xs text-zinc-500">utilidad en periodo</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 uppercase mb-1">Ventas</p>
                    <p className="font-bold text-green-400">{formatCurrency(item.ventas.total)}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.ventas.registros} reg · {formatNumber(item.ventas.cerdosVendidos)} cerdos</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 uppercase mb-1">Alimento</p>
                    <p className="font-bold text-red-400">{formatCurrency(item.consumos.total)}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.consumos.registros} registros</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 uppercase mb-1">Gastos</p>
                    <p className="font-bold text-red-400">{formatCurrency(item.gastos.total)}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.gastos.registros} registros</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 uppercase mb-1">Mortalidades</p>
                    <p className="font-bold text-orange-400">{formatNumber(item.mortalidades.total)}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.mortalidades.registros} registros</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Reportes</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Análisis por lote o por periodo de fechas</p>
      </div>

      {/* Modo */}
      <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg w-fit">
        {(['lote', 'fecha'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setModo(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${modo === m ? 'bg-green-600 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            {m === 'lote' ? 'Por Lote' : 'Por Fecha'}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        {modo === 'lote' ? (
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Select
                label="Seleccionar Lote"
                value={loteSeleccionado}
                onChange={(e) => setLoteSeleccionado(e.target.value)}
              >
                <option value="">Seleccione un lote...</option>
                {(lotes as any[]).map((l: any) => (
                  <option key={l._id} value={l._id}>
                    {l.nombre} — {new Date(l.fechaIngreso).toLocaleDateString('es-HN')}
                    {l.estado === 'finalizado' ? ' (Finalizado)' : ''}
                  </option>
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
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
            >
              Limpiar
            </Button>
          </div>
        )}
      </Card>

      {modo === 'lote' ? renderLoteDetalle() : renderPorFecha()}
    </div>
  );
}
