'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IconPlus, IconTrash, IconPill, IconTruck, IconUsers, IconWrench, IconFileText, IconReceipt } from '@/components/icons';

const CATEGORIAS = [
  { value: 'lechon', label: 'Precio Lechón' },
  { value: 'trabajador', label: 'Pago Trabajadores' },
  { value: 'medicina', label: 'Medicina' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'mano_obra', label: 'Mano de Obra' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'otro', label: 'Otro' },
];

const CATEGORIA_COLOR: Record<string, string> = {
  lechon: 'bg-pink-900/25 text-pink-400 border-pink-800',
  trabajador: 'bg-blue-900/25 text-blue-400 border-blue-800',
  medicina: 'bg-red-900/25 text-red-400 border-red-800',
  transporte: 'bg-yellow-900/25 text-yellow-400 border-yellow-800',
  mano_obra: 'bg-purple-900/25 text-purple-400 border-purple-800',
  servicios: 'bg-cyan-900/25 text-cyan-400 border-cyan-800',
  otro: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

export default function GastosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    loteId: '', categoria: 'otro', descripcion: '', monto: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const { data: gastos = [], mutate } = useSWR('/api/gastos', () => api.gastos.list());
  const { data: lotes = [] } = useSWR('/api/lotes', () => api.lotes.list());

  const totalGastos = (gastos as any[]).reduce((a: number, g: any) => a + g.monto, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.gastos.create({ ...formData, monto: parseFloat(formData.monto), loteId: formData.loteId || undefined });
      mutate();
      setIsModalOpen(false);
      setFormData({ loteId: '', categoria: 'otro', descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0] });
    } catch (error: any) {
      alert(error.message || 'Error al registrar gasto');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Gastos</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Gastos adicionales de operación</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 self-start sm:self-auto">
          <IconPlus size={15} />
          Nuevo Gasto
        </Button>
      </div>

      {/* Total */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Gastos</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalGastos)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Registros</p>
          <p className="text-2xl font-bold text-white mt-1">{(gastos as any[]).length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Promedio por Gasto</p>
          <p className="text-2xl font-bold text-white mt-1">
            {(gastos as any[]).length > 0 ? formatCurrency(totalGastos / (gastos as any[]).length) : formatCurrency(0)}
          </p>
        </div>
      </div>

      <Card>
        {(gastos as any[]).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="hidden sm:table-cell">Lote</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="hidden md:table-cell">Descripción</TableHead>
                <TableHead align="right">Monto</TableHead>
                <TableHead align="right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(gastos as any[]).map((gasto: any) => (
                <TableRow key={gasto._id}>
                  <TableCell className="text-zinc-400 text-sm">{formatDate(gasto.fecha)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-zinc-300 text-sm">{(gasto.loteId as any)?.nombre || 'General'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORIA_COLOR[gasto.categoria] || CATEGORIA_COLOR.otro}`}>
                      {CATEGORIAS.find((c) => c.value === gasto.categoria)?.label || gasto.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400 text-sm max-w-xs">
                    <span className="truncate block">{gasto.descripcion}</span>
                  </TableCell>
                  <TableCell align="right" className="text-red-400 font-medium">{formatCurrency(gasto.monto)}</TableCell>
                  <TableCell align="right">
                    <Button variant="ghost" size="sm" onClick={async () => { if (confirm('¿Eliminar gasto?')) { await api.gastos.delete(gasto._id); mutate(); } }}>
                      <IconTrash size={13} className="text-zinc-500 hover:text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16 text-zinc-400">
            <IconReceipt size={40} className="mx-auto mb-3 text-zinc-700" />
            <p>No hay gastos registrados</p>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Gasto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Lote (opcional)" value={formData.loteId} onChange={(e) => setFormData({ ...formData, loteId: e.target.value })}>
            <option value="">Gasto general (sin lote)</option>
            {(lotes as any[]).map((l: any) => <option key={l._id} value={l._id}>{l.nombre}</option>)}
          </Select>
          <Select label="Categoría" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} required>
            {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Input
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder=""
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <MoneyInput
              label="Monto"
              value={formData.monto}
              onChange={(hnlValue) => setFormData({ ...formData, monto: hnlValue })}
              required
            />
            <Input
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
