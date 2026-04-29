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
import { IconSyringe, IconPlus, IconTrash, IconEdit, IconCalendar, IconAlertTriangle } from '@/components/icons';

const VACUNAS_COMUNES = [
  'Peste Porcina Clásica (PPC)',
  'Fiebre Aftosa',
  'Erisipela Porcina',
  'Circovirus Porcino (PCV2)',
  'Parvovirus Porcino',
  'PRRS',
  'Mycoplasma hyopneumoniae',
  'Leptospirosis',
  'Otra',
];

function daysDiff(date: string | Date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function VacunacionesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterLote, setFilterLote] = useState('');
  const [formData, setFormData] = useState({
    loteId: '', vacuna: '', otraVacuna: '', fecha: new Date().toISOString().split('T')[0],
    dosis: '', aplicadoPor: '', observaciones: '', proximaFecha: '',
  });

  const { data: vacunaciones = [], mutate } = useSWR('/api/vacunaciones', () => api.vacunaciones.list());
  const { data: lotes = [] } = useSWR('/api/lotes', () => api.lotes.list());

  const vacunaFinal = formData.vacuna === 'Otra' ? formData.otraVacuna : formData.vacuna;

  const filtered = filterLote
    ? (vacunaciones as any[]).filter((v: any) => v.loteId?._id === filterLote || v.loteId === filterLote)
    : (vacunaciones as any[]);

  const proximasVacunas = (vacunaciones as any[]).filter((v: any) => {
    if (!v.proximaFecha) return false;
    const days = daysDiff(v.proximaFecha);
    return days >= 0 && days <= 14;
  });

  const openModal = (v?: any) => {
    if (v) {
      setEditingId(v._id);
      const esOtra = !VACUNAS_COMUNES.slice(0, -1).includes(v.vacuna);
      setFormData({
        loteId: v.loteId?._id || v.loteId || '',
        vacuna: esOtra ? 'Otra' : v.vacuna,
        otraVacuna: esOtra ? v.vacuna : '',
        fecha: v.fecha?.split('T')[0] || new Date().toISOString().split('T')[0],
        dosis: v.dosis || '',
        aplicadoPor: v.aplicadoPor || '',
        observaciones: v.observaciones || '',
        proximaFecha: v.proximaFecha?.split('T')[0] || '',
      });
    } else {
      setEditingId(null);
      setFormData({ loteId: '', vacuna: '', otraVacuna: '', fecha: new Date().toISOString().split('T')[0], dosis: '', aplicadoPor: '', observaciones: '', proximaFecha: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacunaFinal) return alert('Especifica el nombre de la vacuna');
    try {
      const payload = {
        loteId: formData.loteId,
        vacuna: vacunaFinal,
        fecha: formData.fecha,
        dosis: formData.dosis,
        aplicadoPor: formData.aplicadoPor,
        observaciones: formData.observaciones,
        proximaFecha: formData.proximaFecha || undefined,
      };
      if (editingId) await api.vacunaciones.update(editingId, payload);
      else await api.vacunaciones.create(payload);
      mutate();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Error al guardar');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Vacunaciones</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Control de vacunas por lote</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2 self-start sm:self-auto">
          <IconPlus size={15} /> Nueva Vacunación
        </Button>
      </div>

      {/* Alertas de próximas vacunas */}
      {proximasVacunas.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconAlertTriangle size={16} className="text-yellow-400" />
            <p className="text-sm font-medium text-yellow-300">Próximas vacunas (próximos 14 días)</p>
          </div>
          <div className="space-y-1.5">
            {proximasVacunas.map((v: any) => {
              const days = daysDiff(v.proximaFecha);
              return (
                <div key={v._id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">
                    <span className="font-medium text-white">{(v.loteId as any)?.nombre || 'Lote'}</span>
                    {' — '}{v.vacuna}
                  </span>
                  <span className={`font-medium ${days === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {days === 0 ? 'Hoy' : `En ${days} día${days !== 1 ? 's' : ''}`}
                  </span>
                </div>
              );
            })}
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
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead>Vacuna</TableHead>
                  <TableHead align="center">Fecha</TableHead>
                  <TableHead>Dosis</TableHead>
                  <TableHead align="center">Próxima</TableHead>
                  <TableHead align="right">Acciones</TableHead>
                </TableRow>
              </thead>
              <TableBody>
                {filtered.map((v: any) => {
                  const days = v.proximaFecha ? daysDiff(v.proximaFecha) : null;
                  const isUrgent = days !== null && days >= 0 && days <= 7;
                  return (
                    <TableRow key={v._id}>
                      <TableCell className="font-medium text-white text-sm">
                        {(v.loteId as any)?.nombre || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <IconSyringe size={12} className="text-blue-400 flex-shrink-0" />
                          <span className="text-zinc-200 text-sm">{v.vacuna}</span>
                        </div>
                        {v.aplicadoPor && <p className="text-xs text-zinc-500 mt-0.5">Por: {v.aplicadoPor}</p>}
                      </TableCell>
                      <TableCell align="center" className="text-zinc-400 text-sm">{formatDate(v.fecha)}</TableCell>
                      <TableCell className="text-zinc-300 text-sm">{v.dosis}</TableCell>
                      <TableCell align="center">
                        {v.proximaFecha ? (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isUrgent ? 'bg-yellow-900/40 text-yellow-300' : 'bg-zinc-800 text-zinc-400'}`}>
                            {days === 0 ? 'Hoy' : (days ?? 0) < 0 ? 'Vencida' : `${days}d`}
                          </span>
                        ) : <span className="text-zinc-600">—</span>}
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="secondary" size="sm" onClick={() => openModal(v)}>
                            <IconEdit size={13} />
                          </Button>
                          <Button variant="danger" size="sm" onClick={async () => { if (confirm('¿Eliminar este registro?')) { await api.vacunaciones.delete(v._id); mutate(); } }}>
                            <IconTrash size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-400">
            <IconSyringe size={40} className="mx-auto mb-3 text-zinc-700" />
            <p>No hay registros de vacunación</p>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Vacunación' : 'Registrar Vacunación'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Lote" value={formData.loteId} onChange={(e) => setFormData({ ...formData, loteId: e.target.value })} required>
            <option value="">Seleccionar lote...</option>
            {(lotes as any[]).map((l: any) => <option key={l._id} value={l._id}>{l.nombre}</option>)}
          </Select>

          <Select label="Vacuna" value={formData.vacuna} onChange={(e) => setFormData({ ...formData, vacuna: e.target.value })} required>
            <option value="">Seleccionar vacuna...</option>
            {VACUNAS_COMUNES.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>

          {formData.vacuna === 'Otra' && (
            <Input label="Nombre de la vacuna" value={formData.otraVacuna} onChange={(e) => setFormData({ ...formData, otraVacuna: e.target.value })} required />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha de aplicación" type="date" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} required />
            <Input label="Dosis" value={formData.dosis} onChange={(e) => setFormData({ ...formData, dosis: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Aplicado por (opcional)" value={formData.aplicadoPor} onChange={(e) => setFormData({ ...formData, aplicadoPor: e.target.value })} />
            <div>
              <Input label="Próxima dosis (opcional)" type="date" value={formData.proximaFecha} onChange={(e) => setFormData({ ...formData, proximaFecha: e.target.value })} />
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><IconCalendar size={10} /> Para recordatorio automático</p>
            </div>
          </div>

          <Input label="Observaciones (opcional)" value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">{editingId ? 'Actualizar' : 'Registrar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
