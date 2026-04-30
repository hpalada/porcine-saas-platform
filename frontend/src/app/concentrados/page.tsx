'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { IconWheat, IconPlus, IconEdit, IconTrash, IconPackage, IconAlertCircle, IconCheckCircle } from '@/components/icons';

const KG_PER_LB = 0.453592;

type Tab = 'tipos' | 'consumos';

export default function ConcentradosPage() {
  const [tab, setTab] = useState<Tab>('tipos');

  // ── Tipos state ──────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConcentrado, setEditingConcentrado] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precioActual: '' });
  const [precioMode, setPrecioMode] = useState<'unitario' | 'total'>('unitario');
  const [precioTotal, setPrecioTotal] = useState('');
  const [cantidadBolsas, setCantidadBolsas] = useState('1');
  const [pesoPorSaco, setPesoPorSaco] = useState('50');
  const [unidadPeso, setUnidadPeso] = useState<'kg' | 'lb'>('kg');

  // ── Consumos state ───────────────────────────────────────────
  const [consumoForm, setConsumoForm] = useState({
    loteId: '',
    concentradoTipoId: '',
    cantidad: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
  });
  const [consumoLoading, setConsumoLoading] = useState(false);
  const [consumoError, setConsumoError] = useState('');
  const [filtroLote, setFiltroLote] = useState('');

  // ── Data ─────────────────────────────────────────────────────
  const { data: concentrados = [], mutate } = useSWR('/api/concentrados', () => api.concentrados.list());
  const { data: lotes = [] } = useSWR('/api/lotes', () => api.lotes.list());
  const { data: inventario = [] } = useSWR('/api/inventario', () => api.inventario.stockActual());
  const { data: consumos = [], mutate: mutateConsumos } = useSWR(
    '/api/consumos?limite=100',
    () => api.consumos.list({ limite: '100' })
  );

  const lotesActivos = (lotes as any[]).filter((l: any) => l.estado === 'activo');

  // Consumo form derived values
  const concentradoSel = (concentrados as any[]).find((c: any) => c._id === consumoForm.concentradoTipoId);
  const stockDisponible = consumoForm.concentradoTipoId
    ? ((inventario as any[]).find((i: any) => i._id === consumoForm.concentradoTipoId)?.stock ?? 0)
    : null;
  const cantidadNum = parseFloat(consumoForm.cantidad) || 0;
  const costoEstimado = concentradoSel ? cantidadNum * concentradoSel.precioActual : 0;

  // Filtered consumos
  const consumosFiltrados = filtroLote
    ? (consumos as any[]).filter((c: any) => c.loteId?._id === filtroLote || c.loteId === filtroLote)
    : (consumos as any[]);

  const totalCostoFiltrado = consumosFiltrados.reduce((a: number, c: any) => a + c.costoTotal, 0);

  // ── Tipos handlers ───────────────────────────────────────────
  const precioCalculado = precioMode === 'total' && precioTotal && cantidadBolsas
    ? (parseFloat(precioTotal) / parseFloat(cantidadBolsas)).toFixed(2)
    : formData.precioActual;

  const openModal = (c?: any) => {
    if (c) {
      setEditingConcentrado(c);
      setFormData({ nombre: c.nombre, descripcion: c.descripcion || '', precioActual: String(c.precioActual) });
      setPesoPorSaco(c.pesoPorSaco ? String(c.pesoPorSaco) : '50');
      setUnidadPeso('kg');
    } else {
      setEditingConcentrado(null);
      setFormData({ nombre: '', descripcion: '', precioActual: '' });
      setPesoPorSaco('50');
      setUnidadPeso('kg');
    }
    setPrecioMode('unitario');
    setPrecioTotal('');
    setCantidadBolsas('1');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const precio = precioMode === 'total'
        ? parseFloat(precioTotal) / parseFloat(cantidadBolsas || '1')
        : parseFloat(formData.precioActual);
      const pesoNum = parseFloat(pesoPorSaco) || 0;
      const pesoEnKg = unidadPeso === 'lb' ? pesoNum * KG_PER_LB : pesoNum;
      const data: any = { ...formData, precioActual: precio, unidad: 'saco', pesoPorSaco: pesoEnKg };
      if (editingConcentrado) await api.concentrados.update(editingConcentrado._id, data);
      else await api.concentrados.create(data);
      mutate();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Error al guardar');
    }
  };

  // ── Consumo handlers ─────────────────────────────────────────
  const handleRegistrarConsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsumoError('');
    if (stockDisponible !== null && cantidadNum > stockDisponible) {
      setConsumoError(`Stock insuficiente. Disponible: ${stockDisponible} ${concentradoSel?.unidad || 'uds'}`);
      return;
    }
    setConsumoLoading(true);
    try {
      await api.consumos.create({ ...consumoForm, cantidad: cantidadNum });
      mutateConsumos();
      setConsumoForm({
        loteId: '',
        concentradoTipoId: '',
        cantidad: '',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: '',
      });
    } catch (err: any) {
      setConsumoError(err.message || 'Error al registrar consumo');
    }
    setConsumoLoading(false);
  };

  const handleEliminarConsumo = async (id: string) => {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      await api.consumos.delete(id);
      mutateConsumos();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Concentrados</h1>
          <p className="text-sm mt-0.5 text-zinc-400">Tipos de alimento y registro de consumo por lote</p>
        </div>
        {tab === 'tipos' && (
          <Button onClick={() => openModal()} className="flex items-center gap-2 self-start sm:self-auto">
            <IconPlus size={15} /> Nuevo Concentrado
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg w-fit">
        {([
          { key: 'tipos', label: 'Tipos de Concentrado' },
          { key: 'consumos', label: 'Consumo por Lote' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t.key ? 'bg-green-600 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: TIPOS ── */}
      {tab === 'tipos' && (
        <Card>
          {(concentrados as any[]).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead align="right">Precio</TableHead>
                    <TableHead align="right">Actualizado</TableHead>
                    <TableHead align="right">Acciones</TableHead>
                  </TableRow>
                </thead>
                <TableBody>
                  {(concentrados as any[]).map((c: any) => (
                    <TableRow key={c._id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-800">
                            <IconWheat size={14} className="text-yellow-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-white">{c.nombre}</p>
                            {c.descripcion && <p className="text-xs text-zinc-500">{c.descripcion}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                          <IconPackage size={13} />
                          Saco ({c.pesoPorSaco ?? 50} kg)
                        </div>
                      </TableCell>
                      <TableCell align="right" className="font-medium text-green-400">{formatCurrency(c.precioActual)}</TableCell>
                      <TableCell align="right" className="text-sm text-zinc-500">{formatDate(c.updatedAt)}</TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="secondary" size="sm" onClick={() => openModal(c)} className="flex items-center gap-1">
                            <IconEdit size={13} />
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                          <Button variant="danger" size="sm" onClick={async () => { if (confirm('¿Eliminar concentrado?')) { await api.concentrados.delete(c._id); mutate(); } }}>
                            <IconTrash size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-400">
              <IconWheat size={40} className="mx-auto mb-3 text-zinc-700" />
              <p>No hay tipos de concentrado registrados</p>
            </div>
          )}
        </Card>
      )}

      {/* ── TAB: CONSUMOS ── */}
      {tab === 'consumos' && (
        <div className="space-y-5">
          {/* Formulario de registro */}
          <Card>
            <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
              <IconWheat size={15} className="text-yellow-400" />
              Registrar Consumo
            </h2>
            <form onSubmit={handleRegistrarConsumo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Lote"
                  value={consumoForm.loteId}
                  onChange={(e) => setConsumoForm({ ...consumoForm, loteId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar lote...</option>
                  {lotesActivos.map((l: any) => (
                    <option key={l._id} value={l._id}>{l.nombre} ({l.cantidadActual} animales)</option>
                  ))}
                </Select>

                <Select
                  label="Tipo de Concentrado"
                  value={consumoForm.concentradoTipoId}
                  onChange={(e) => setConsumoForm({ ...consumoForm, concentradoTipoId: e.target.value, cantidad: '' })}
                  required
                >
                  <option value="">Seleccionar concentrado...</option>
                  {(concentrados as any[]).map((c: any) => (
                    <option key={c._id} value={c._id}>{c.nombre} — {formatCurrency(c.precioActual)}/{c.unidad}</option>
                  ))}
                </Select>
              </div>

              {stockDisponible !== null && (
                <div className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                  stockDisponible < 10
                    ? 'bg-red-900/15 border-red-800 text-red-400'
                    : stockDisponible < 20
                    ? 'bg-yellow-900/15 border-yellow-800 text-yellow-400'
                    : 'bg-green-900/15 border-green-800 text-green-400'
                }`}>
                  <span>Stock disponible en bodega</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    {stockDisponible < 20 ? <IconAlertCircle size={14} /> : <IconCheckCircle size={14} />}
                    {stockDisponible} {concentradoSel?.unidad || 'uds'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={`Cantidad (${concentradoSel?.unidad || 'uds'})`}
                  type="number"
                  value={consumoForm.cantidad}
                  onChange={(e) => setConsumoForm({ ...consumoForm, cantidad: e.target.value })}
                  placeholder="0"
                  min="0.1"
                  step="0.1"
                  required
                />
                <Input
                  label="Fecha"
                  type="date"
                  value={consumoForm.fecha}
                  onChange={(e) => setConsumoForm({ ...consumoForm, fecha: e.target.value })}
                  required
                />
              </div>

              {costoEstimado > 0 && (
                <div className="flex items-center justify-between p-4 bg-green-900/15 border border-green-900/40 rounded-lg">
                  <div>
                    <p className="text-xs text-green-300 mb-0.5">Costo estimado</p>
                    <p className="text-xs text-green-400/60">{consumoForm.cantidad} × {formatCurrency(concentradoSel?.precioActual || 0)}</p>
                  </div>
                  <div className="text-xl font-bold text-green-400">{formatCurrency(costoEstimado)}</div>
                </div>
              )}

              <Input
                label="Observaciones (opcional)"
                value={consumoForm.observaciones}
                onChange={(e) => setConsumoForm({ ...consumoForm, observaciones: e.target.value })}
                placeholder=""
              />

              {consumoError && (
                <div className="flex items-center gap-2 p-3 bg-red-900/15 border border-red-900/40 rounded-lg text-red-400 text-sm">
                  <IconAlertCircle size={14} />
                  {consumoError}
                </div>
              )}

              <Button type="submit" disabled={consumoLoading} className="w-full sm:w-auto flex items-center gap-2">
                <IconPlus size={15} />
                {consumoLoading ? 'Registrando...' : 'Registrar Consumo'}
              </Button>
            </form>
          </Card>

          {/* Historial filtrado por lote */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-sm font-semibold text-zinc-300">Historial de Consumos</h2>
              <div className="flex items-center gap-3">
                {filtroLote && (
                  <span className="text-xs text-zinc-400">
                    Total: <span className="text-red-400 font-medium">{formatCurrency(totalCostoFiltrado)}</span>
                  </span>
                )}
                <select
                  value={filtroLote}
                  onChange={(e) => setFiltroLote(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500"
                >
                  <option value="">Todos los lotes</option>
                  {(lotes as any[]).map((l: any) => (
                    <option key={l._id} value={l._id}>{l.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {consumosFiltrados.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead className="hidden sm:table-cell">Concentrado</TableHead>
                    <TableHead align="center">Cantidad</TableHead>
                    <TableHead align="right">Costo</TableHead>
                    <TableHead align="right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumosFiltrados.map((c: any) => (
                    <TableRow key={c._id}>
                      <TableCell className="text-zinc-400 text-sm">{formatDate(c.fecha)}</TableCell>
                      <TableCell className="font-medium text-white text-sm">{c.loteId?.nombre || '—'}</TableCell>
                      <TableCell className="hidden sm:table-cell text-zinc-300 text-sm">{c.concentradoTipoId?.nombre || '—'}</TableCell>
                      <TableCell align="center" className="text-zinc-300">{formatNumber(c.cantidad)}</TableCell>
                      <TableCell align="right" className="text-red-400 font-medium">{formatCurrency(c.costoTotal)}</TableCell>
                      <TableCell align="right">
                        <Button variant="ghost" size="sm" onClick={() => handleEliminarConsumo(c._id)}>
                          <IconTrash size={13} className="text-zinc-500 hover:text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                <IconWheat size={36} className="mx-auto mb-3 text-zinc-700" />
                <p className="text-sm">No hay consumos registrados{filtroLote ? ' para este lote' : ''}</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal Tipo Concentrado */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingConcentrado ? 'Editar Concentrado' : 'Nuevo Concentrado'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre / Fase" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
          <Input label="Descripción (opcional)" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-zinc-300">Peso por saco</label>
              <div className="flex gap-1 text-xs">
                {(['kg', 'lb'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnidadPeso(u)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${unidadPeso === u ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <Input
              type="number"
              value={pesoPorSaco}
              onChange={(e) => setPesoPorSaco(e.target.value)}
              step="0.01"
              min="0.01"
              required
            />
            {pesoPorSaco && unidadPeso === 'lb' && (
              <p className="text-xs mt-1 text-zinc-500">
                Equivalente: {(parseFloat(pesoPorSaco) * KG_PER_LB).toFixed(2)} kg
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-300">Precio</label>
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPrecioMode('unitario')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${precioMode === 'unitario' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Por unidad
                </button>
                <button
                  type="button"
                  onClick={() => setPrecioMode('total')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${precioMode === 'total' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Precio total ÷ cantidad
                </button>
              </div>
            </div>

            {precioMode === 'unitario' ? (
              <MoneyInput
                value={formData.precioActual}
                onChange={(hnlValue) => setFormData({ ...formData, precioActual: hnlValue })}
                required
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs mb-1 text-zinc-500">Precio total pagado</p>
                  <MoneyInput
                    value={precioTotal}
                    onChange={(hnlValue) => setPrecioTotal(hnlValue)}
                    required
                  />
                </div>
                <div>
                  <p className="text-xs mb-1 text-zinc-500">Cantidad de unidades</p>
                  <Input
                    type="number"
                    value={cantidadBolsas}
                    onChange={(e) => setCantidadBolsas(e.target.value)}
                    min="1"
                    step="1"
                  />
                </div>
                {precioTotal && cantidadBolsas && (
                  <div className="col-span-2 text-sm rounded-lg px-3 py-2 text-green-400 bg-green-900/20">
                    Precio por unidad: <span className="font-semibold">{precioCalculado}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">{editingConcentrado ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
