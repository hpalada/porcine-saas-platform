'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { IconSkull, IconPlus, IconTrash, IconEdit, IconAlertTriangle } from '@/components/icons';

const MOTIVOS_COMUNES = [
  'Enfermedad respiratoria',
  'Enfermedad digestiva',
  'Infección bacterial',
  'Infección viral',
  'Deficiencia nutricional',
  'Accidente',
  'Desconocido',
  'Otro',
];

export default function MortalidadesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterLote, setFilterLote] = useState('');
  const [formData, setFormData] = useState({
    loteId: '',
    cantidadMuertas: '',
    motivo: '',
    otroMotivo: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  const { data: mortalidades = [], mutate } = useSWR('/api/mortalidades', () => api.mortalidades.list());
  const { data: lotes = [], mutate: mutateLotes } = useSWR('/api/lotes', () => api.lotes.list());
  const lotesActivos = (lotes as any[]).filter((l: any) => l.estado === 'activo');

  const motivoFinal = formData.motivo === 'Otro' ? formData.otroMotivo : formData.motivo;

  const filtered = filterLote
    ? (mortalidades as any[]).filter((m: any) => m.loteId?._id === filterLote || m.loteId === filterLote)
    : (mortalidades as any[]);

  const totalMuertas = filtered.reduce((sum: number, m: any) => sum + (m.cantidadMuertas || 0), 0);

  const openModal = (m?: any) => {
    if (m) {
      setEditingId(m._id);
      const esOtro = !MOTIVOS_COMUNES.slice(0, -1).includes(m.motivo);
      setFormData({
        loteId: m.loteId?._id || m.loteId || '',
        cantidadMuertas: m.cantidadMuertas?.toString() || '',
        motivo: esOtro ? 'Otro' : m.motivo,
        otroMotivo: esOtro ? m.motivo : '',
        fecha: m.fecha?.split('T')[0] || new Date().toISOString().split('T')[0],
        observaciones: m.observaciones || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        loteId: '',
        cantidadMuertas: '',
        motivo: '',
        otroMotivo: '',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoFinal) return alert('Especifica el motivo de la mortalidad');
    if (!formData.cantidadMuertas || parseInt(formData.cantidadMuertas) <= 0) {
      return alert('La cantidad debe ser mayor a 0');
    }
    try {
      const payload = {
        loteId: formData.loteId,
        cantidadMuertas: parseInt(formData.cantidadMuertas),
        motivo: motivoFinal,
        fecha: formData.fecha,
        observaciones: formData.observaciones,
      };
      if (editingId) await api.mortalidades.actualizar(editingId, payload);
      else await api.mortalidades.crear(payload);
      mutate();
      mutateLotes();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Error al guardar');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Mortalidades</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Registro de animales fallecidos por lote</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2 self-start sm:self-auto">
          <IconPlus size={15} /> Registrar Mortalidad
        </Button>
      </div>

      {totalMuertas > 0 && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconAlertTriangle size={16} className="text-red-400" />
            <p className="text-sm font-medium text-red-300">
              Total de mortalidades registradas: <span className="font-bold text-red-300">{totalMuertas} animal{totalMuertas !== 1 ? 'es' : ''}</span>
            </p>
          </div>
        </div>
      )}

      {/* Filtro por lote */}
      <div className="flex items-center gap-3">
        <Select value={filterLote} onChange={(e) => setFilterLote(e.target.value)} className="max-w-xs">
          <option value="">Todos los lotes</option>
          {(lotes as any[]).map((l: any) => <option key={l._id} value={l._id}>{l.nombre}</option>)}
        </Select>
        <p className="text-sm text-zinc-500">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <Card>
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead align="center">Cantidad</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead align="center">Fecha</TableHead>
                  <TableHead align="right">Acciones</TableHead>
                </TableRow>
              </thead>
              <TableBody>
                {filtered.map((m: any) => (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium text-white text-sm">
                      {(m.loteId as any)?.nombre || '—'}
                    </TableCell>
                    <TableCell align="center">
                      <span className="font-semibold text-red-400">{m.cantidadMuertas}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <IconSkull size={12} className="text-red-400 flex-shrink-0" />
                        <span className="text-zinc-200 text-sm">{m.motivo}</span>
                      </div>
                      {m.observaciones && <p className="text-xs text-zinc-500 mt-0.5">{m.observaciones}</p>}
                    </TableCell>
                    <TableCell align="center" className="text-zinc-400 text-sm">{formatDate(m.fecha)}</TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => openModal(m)}>
                          <IconEdit size={13} />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={async () => {
                            if (confirm('¿Eliminar este registro? Se revertirán los cambios en la cantidad de animales del lote.')) {
                              await api.mortalidades.eliminar(m._id);
                              mutate();
                              mutateLotes();
                            }
                          }}
                        >
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
            <IconSkull size={40} className="mx-auto mb-3 text-zinc-700" />
            <p>No hay registros de mortalidad</p>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Mortalidad' : 'Registrar Mortalidad'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Lote" value={formData.loteId} onChange={(e) => setFormData({ ...formData, loteId: e.target.value })} required>
            <option value="">Seleccionar lote...</option>
            {lotesActivos.map((l: any) => (
              <option key={l._id} value={l._id}>
                {l.nombre} — {new Date(l.fechaIngreso).toLocaleDateString('es-HN')} ({l.cantidadActual} animales)
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cantidad de animales"
              type="number"
              min="1"
              value={formData.cantidadMuertas}
              onChange={(e) => setFormData({ ...formData, cantidadMuertas: e.target.value })}
              required
            />
            <Input label="Fecha" type="date" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} required />
          </div>

          <Select label="Motivo" value={formData.motivo} onChange={(e) => setFormData({ ...formData, motivo: e.target.value })} required>
            <option value="">Seleccionar motivo...</option>
            {MOTIVOS_COMUNES.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>

          {formData.motivo === 'Otro' && (
            <Input label="Especificar motivo" value={formData.otroMotivo} onChange={(e) => setFormData({ ...formData, otroMotivo: e.target.value })} required />
          )}

          <Input label="Observaciones (opcional)" value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {editingId ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
