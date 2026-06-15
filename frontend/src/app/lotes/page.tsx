'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { api } from '@/lib/api-client';
import { formatNumber, formatDate, formatCurrency } from '@/lib/utils';
import { IconPackage, IconPlus, IconEdit, IconTrash, IconNote, IconSyringe, IconCalendar, IconClock, IconWheat, IconAlertCircle, IconCheckCircle } from '@/components/icons';

const TIPOS_NOTA = [
  { value: 'vacunacion', label: 'Vacunación' },
  { value: 'desparasitacion', label: 'Desparasitación' },
  { value: 'vitaminas', label: 'Vitaminas' },
  { value: 'medicina', label: 'Medicina' },
  { value: 'observacion', label: 'Observación' },
  { value: 'otro', label: 'Otro' },
];

const notaColor: Record<string, string> = {
  vacunacion: 'bg-blue-900/25 text-blue-400 border-blue-800',
  desparasitacion: 'bg-orange-900/25 text-orange-400 border-orange-800',
  vitaminas: 'bg-yellow-900/25 text-yellow-400 border-yellow-800',
  medicina: 'bg-red-900/25 text-red-400 border-red-800',
  observacion: 'bg-purple-900/25 text-purple-400 border-purple-800',
  otro: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

export default function LotesPage() {
  const [tab, setTab] = useState<'activos' | 'finalizados'>('activos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotasModalOpen, setIsNotasModalOpen] = useState(false);
  const [isConcentradoModalOpen, setIsConcentradoModalOpen] = useState(false);
  const [editingLote, setEditingLote] = useState<any>(null);
  const [selectedLote, setSelectedLote] = useState<any>(null);
  const [selectedLoteConcentrado, setSelectedLoteConcentrado] = useState<any>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    cantidadInicial: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    horaIngreso: new Date().toTimeString().slice(0, 5),
    descripcion: '',
    estado: 'activo',
    cantidadSalida: '',
  });

  const [notaForm, setNotaForm] = useState({
    tipo: 'vacunacion',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const [consumoForm, setConsumoForm] = useState({
    concentradoTipoId: '',
    cantidad: '',
    fecha: new Date().toISOString().split('T')[0],
  });
  const [consumoLoading, setConsumoLoading] = useState(false);

  const { data: lotes = [], mutate } = useSWR('/api/lotes', () => api.lotes.list());
  const { data: notas = [], mutate: mutateNotas } = useSWR(
    selectedLote ? `/api/notas/lote/${selectedLote._id}` : null,
    () => selectedLote ? api.notas.porLote(selectedLote._id) : null
  );
  const { data: consumosLote = [], mutate: mutateConsumos } = useSWR(
    selectedLoteConcentrado ? `/api/consumos/lote/${selectedLoteConcentrado._id}` : null,
    () => selectedLoteConcentrado ? api.consumos.porLote(selectedLoteConcentrado._id) : null
  );
  const { data: concentradosTipos = [] } = useSWR('/api/concentrados', () => api.concentrados.list());
  const { data: inventarioStock = [] } = useSWR('/api/inventario', () => api.inventario.stockActual());

  const lotesActivos = (lotes as any[]).filter((l) => l.estado === 'activo');
  const lotesFinalizados = (lotes as any[]).filter((l) => l.estado === 'finalizado');
  const lotesFiltrados = tab === 'activos' ? lotesActivos : lotesFinalizados;

  // Concentrado modal derived values
  const concentradoSel = (concentradosTipos as any[]).find((c: any) => c._id === consumoForm.concentradoTipoId);
  const stockDisponible = consumoForm.concentradoTipoId
    ? ((inventarioStock as any[]).find((i: any) => i._id === consumoForm.concentradoTipoId)?.stock ?? 0)
    : null;
  const cantidadNum = parseFloat(consumoForm.cantidad) || 0;
  const costoEstimado = concentradoSel ? cantidadNum * concentradoSel.precioActual : 0;
  const totalConsumos = (consumosLote as any[]).reduce((a: number, c: any) => a + c.costoTotal, 0);
  const totalSacos = (consumosLote as any[]).reduce((a: number, c: any) => a + c.cantidad, 0);

  const openModal = (lote?: any) => {
    if (lote) {
      setEditingLote(lote);
      setFormData({
        nombre: lote.nombre,
        cantidadInicial: String(lote.cantidadInicial),
        fechaIngreso: new Date(lote.fechaIngreso).toISOString().split('T')[0],
        horaIngreso: lote.horaIngreso || '00:00',
        descripcion: lote.descripcion || '',
        estado: lote.estado,
        cantidadSalida: String(lote.cantidadSalida || 0),
      });
    } else {
      setEditingLote(null);
      setFormData({
        nombre: '',
        cantidadInicial: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        horaIngreso: new Date().toTimeString().slice(0, 5),
        descripcion: '',
        estado: 'activo',
        cantidadSalida: '0',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        nombre: formData.nombre,
        fechaIngreso: formData.fechaIngreso,
        horaIngreso: formData.horaIngreso,
        cantidadInicial: parseInt(formData.cantidadInicial),
        descripcion: formData.descripcion,
        estado: formData.estado,
      };
      if (editingLote) {
        if (formData.cantidadSalida !== '') data.cantidadSalida = parseInt(formData.cantidadSalida);
        await api.lotes.update(editingLote._id, data);
      } else {
        await api.lotes.create(data);
      }
      await mutate();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Error al guardar lote');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este lote? Esta acción no se puede deshacer.')) return;
    try {
      await api.lotes.delete(id);
      mutate();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar');
    }
  };

  const openNotas = (lote: any) => {
    setSelectedLote(lote);
    setIsNotasModalOpen(true);
  };

  const openConcentrado = (lote: any) => {
    setSelectedLoteConcentrado(lote);
    setConsumoForm({ concentradoTipoId: '', cantidad: '', fecha: new Date().toISOString().split('T')[0] });
    setIsConcentradoModalOpen(true);
  };

  const handleCrearNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLote) return;
    try {
      await api.notas.create({ loteId: selectedLote._id, ...notaForm });
      mutateNotas();
      setNotaForm({ tipo: 'vacunacion', descripcion: '', fecha: new Date().toISOString().split('T')[0] });
    } catch (error: any) {
      alert(error.message || 'Error al crear nota');
    }
  };

  const handleEliminarNota = async (id: string) => {
    try {
      await api.notas.delete(id);
      mutateNotas();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar nota');
    }
  };

  const handleRegistrarConsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoteConcentrado) return;
    setConsumoLoading(true);
    try {
      await api.consumos.create({
        loteId: selectedLoteConcentrado._id,
        concentradoTipoId: consumoForm.concentradoTipoId,
        cantidad: cantidadNum,
        fecha: consumoForm.fecha,
      });
      mutateConsumos();
      setConsumoForm({ concentradoTipoId: '', cantidad: '', fecha: new Date().toISOString().split('T')[0] });
    } catch (error: any) {
      alert(error.message || 'Error al registrar consumo');
    }
    setConsumoLoading(false);
  };

  const handleEliminarConsumo = async (id: string) => {
    if (!confirm('¿Eliminar este registro de consumo?')) return;
    try {
      await api.consumos.delete(id);
      mutateConsumos();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Lotes</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Gestión de lotes de producción</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2 self-start sm:self-auto">
          <IconPlus size={15} />
          Nuevo Lote
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: (lotes as any[]).length, color: 'text-white' },
          { label: 'Activos', value: lotesActivos.length, color: 'text-green-400' },
          { label: 'Finalizados', value: lotesFinalizados.length, color: 'text-zinc-400' },
          { label: 'Animales Activos', value: formatNumber(lotesActivos.reduce((a: number, l: any) => a + (l.cantidadActual || 0), 0)), color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg w-fit">
        {(['activos', 'finalizados'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-green-600 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <Card>
        {lotesFiltrados.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha Ingreso</TableHead>
                <TableHead className="hidden md:table-cell" align="center">Inicial</TableHead>
                <TableHead align="center">Actual</TableHead>
                <TableHead className="hidden md:table-cell" align="center">Salidas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead align="right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotesFiltrados.map((lote: any) => (
                <TableRow key={lote._id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <IconPackage size={14} className="text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{lote.nombre}</p>
                        {lote.descripcion && <p className="text-xs text-zinc-500 truncate hidden sm:block">{lote.descripcion}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <IconCalendar size={12} />
                      <span>{formatDate(lote.fechaIngreso)}</span>
                    </div>
                    {lote.horaIngreso && lote.horaIngreso !== '00:00' && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <IconClock size={11} />
                        <span className="text-xs">{lote.horaIngreso}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell" align="center">
                    <span className="text-zinc-300">{formatNumber(lote.cantidadInicial)}</span>
                  </TableCell>
                  <TableCell align="center">
                    <span className="text-white font-medium">{formatNumber(lote.cantidadActual)}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell" align="center">
                    <span className={lote.cantidadSalida > 0 ? 'text-orange-400' : 'text-zinc-500'}>{formatNumber(lote.cantidadSalida)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lote.estado === 'activo' ? 'active' : 'finalizado'}>
                      {lote.estado === 'activo' ? 'Activo' : 'Finalizado'}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => openConcentrado(lote)} title="Concentrado">
                        <IconWheat size={14} className="text-yellow-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openNotas(lote)} title="Notas">
                        <IconNote size={14} />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => openModal(lote)}>
                        <IconEdit size={13} />
                        <span className="hidden sm:inline ml-1">Editar</span>
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(lote._id)}>
                        <IconTrash size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16 text-zinc-400">
            <IconPackage size={40} className="mx-auto mb-3 text-zinc-700" />
            <p>No hay lotes {tab === 'activos' ? 'activos' : 'finalizados'}</p>
            {tab === 'activos' && (
              <button onClick={() => openModal()} className="mt-3 text-green-500 text-sm hover:underline">
                Crear el primer lote
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Modal Lote */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLote ? 'Editar Lote' : 'Nuevo Lote'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Lote"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder=""
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha de Ingreso"
              type="date"
              value={formData.fechaIngreso}
              onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
              required
            />
            <Input
              label="Hora de Ingreso"
              type="time"
              value={formData.horaIngreso}
              onChange={(e) => setFormData({ ...formData, horaIngreso: e.target.value })}
            />
          </div>
          <Input
            label="Cantidad Inicial de Animales"
            type="number"
            value={formData.cantidadInicial}
            onChange={(e) => setFormData({ ...formData, cantidadInicial: e.target.value })}
            placeholder=""
            min="1"
            required
            disabled={!!editingLote}
          />
          {editingLote && (
            <Input
              label={`Cantidad de Salida (máx: ${editingLote.cantidadInicial})`}
              type="number"
              value={formData.cantidadSalida}
              onChange={(e) => setFormData({ ...formData, cantidadSalida: e.target.value })}
              placeholder="0"
              min="0"
              max={editingLote.cantidadInicial}
            />
          )}
          <Select
            label="Estado"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
          >
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
          </Select>
          <Input
            label="Descripción (opcional)"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder=""
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">{editingLote ? 'Actualizar' : 'Crear'} Lote</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Notas */}
      <Modal isOpen={isNotasModalOpen} onClose={() => setIsNotasModalOpen(false)} title={`Notas — ${selectedLote?.nombre}`} size="lg">
        <div className="space-y-5">
          <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50">
            <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
              <IconSyringe size={14} className="text-green-400" />
              Nueva Nota
            </h3>
            <form onSubmit={handleCrearNota} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Tipo"
                  value={notaForm.tipo}
                  onChange={(e) => setNotaForm({ ...notaForm, tipo: e.target.value })}
                >
                  {TIPOS_NOTA.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
                <Input
                  label="Fecha"
                  type="date"
                  value={notaForm.fecha}
                  onChange={(e) => setNotaForm({ ...notaForm, fecha: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Descripción"
                value={notaForm.descripcion}
                onChange={(e) => setNotaForm({ ...notaForm, descripcion: e.target.value })}
                placeholder=""
                required
              />
              <Button type="submit" size="sm" className="flex items-center gap-2">
                <IconPlus size={13} />
                Agregar Nota
              </Button>
            </form>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">Historial de Notas</h3>
            {(notas as any[]).length > 0 ? (
              (notas as any[]).map((nota: any) => (
                <div key={nota._id} className="flex items-start gap-3 p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/30">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-0.5 flex-shrink-0 ${notaColor[nota.tipo] || notaColor.otro}`}>
                    {TIPOS_NOTA.find((t) => t.value === nota.tipo)?.label || nota.tipo}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{nota.descripcion}</p>
                    <p className="text-xs text-zinc-500 mt-1">{formatDate(nota.fecha)}</p>
                  </div>
                  <button
                    onClick={() => handleEliminarNota(nota._id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm text-center py-6">No hay notas registradas para este lote</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Concentrados por Lote */}
      <Modal isOpen={isConcentradoModalOpen} onClose={() => setIsConcentradoModalOpen(false)} title={`Concentrado — ${selectedLoteConcentrado?.nombre}`} size="lg">
        <div className="space-y-5">
          {/* Resumen */}
          {(consumosLote as any[]).length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Consumido</p>
                <p className="text-lg font-bold text-white">{formatNumber(totalSacos)} <span className="text-xs font-normal text-zinc-400">uds</span></p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Costo Total</p>
                <p className="text-lg font-bold text-red-400">{formatCurrency(totalConsumos)}</p>
              </div>
            </div>
          )}

          {/* Formulario nuevo consumo */}
          <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50">
            <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
              <IconWheat size={14} className="text-yellow-400" />
              Registrar Consumo
            </h3>
            <form onSubmit={handleRegistrarConsumo} className="space-y-3">
              <Select
                label="Tipo de Concentrado"
                value={consumoForm.concentradoTipoId}
                onChange={(e) => setConsumoForm({ ...consumoForm, concentradoTipoId: e.target.value, cantidad: '' })}
                required
              >
                <option value="">Seleccionar concentrado...</option>
                {(concentradosTipos as any[]).map((c: any) => (
                  <option key={c._id} value={c._id}>{c.nombre} — {formatCurrency(c.precioActual)}/{c.unidad}</option>
                ))}
              </Select>

              {stockDisponible !== null && (
                <div className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                  stockDisponible < 10
                    ? 'bg-red-900/15 border-red-800 text-red-400'
                    : stockDisponible < 20
                    ? 'bg-yellow-900/15 border-yellow-800 text-yellow-400'
                    : 'bg-green-900/15 border-green-800 text-green-400'
                }`}>
                  <span>Stock disponible en granja</span>
                  <div className="flex items-center gap-1 font-medium">
                    {stockDisponible < 20 ? <IconAlertCircle size={12} /> : <IconCheckCircle size={12} />}
                    {stockDisponible} {concentradoSel?.unidad || 'uds'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
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
                <div className="flex items-center justify-between p-3 bg-green-900/10 border border-green-900/30 rounded-lg">
                  <p className="text-xs text-green-300">Costo estimado</p>
                  <p className="text-base font-bold text-green-400">{formatCurrency(costoEstimado)}</p>
                </div>
              )}

              <Button type="submit" size="sm" disabled={consumoLoading} className="flex items-center gap-2">
                <IconPlus size={13} />
                {consumoLoading ? 'Registrando...' : 'Agregar Consumo'}
              </Button>
            </form>
          </div>

          {/* Historial de consumos del lote */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">Historial de Consumos</h3>
            {(consumosLote as any[]).length > 0 ? (
              <div className="space-y-1.5">
                {(consumosLote as any[]).map((c: any) => (
                  <div key={c._id} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{(c.concentradoTipoId as any)?.nombre || '—'}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{formatDate(c.fecha)} · {formatNumber(c.cantidad)} {(c.concentradoTipoId as any)?.unidad || 'uds'}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className="text-sm font-medium text-red-400">{formatCurrency(c.costoTotal)}</span>
                      <button
                        onClick={() => handleEliminarConsumo(c._id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-6">No hay consumos registrados para este lote</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
