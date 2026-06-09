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
import { MoneyInput } from '@/components/ui/MoneyInput';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { IconPlus, IconTrendingUp, IconTrash } from '@/components/icons';

const KG_PER_LB = 0.453592;

export default function VentasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unidadPeso, setUnidadPeso] = useState<'kg' | 'lb'>('kg');
  const [formData, setFormData] = useState({
    loteId: '', cantidadCerdos: '', pesoTotal: '', precio: '',
    fechaVenta: new Date().toISOString().split('T')[0],
    comprador: '',
  });

  const { data: ventas = [], mutate } = useSWR('/api/ventas', () => api.ventas.list());
  const { data: lotes = [], mutate: mutateLotes } = useSWR('/api/lotes', () => api.lotes.list());
  const lotesActivos = (lotes as any[]).filter((l: any) => l.estado === 'activo');

  const pesoTotal = parseFloat(formData.pesoTotal) || 0;
  const precio = parseFloat(formData.precio) || 0;

  // Always compute income in kg internally
  const pesoKg = unidadPeso === 'lb' ? pesoTotal * KG_PER_LB : pesoTotal;
  const precioKg = unidadPeso === 'lb' ? precio / KG_PER_LB : precio;
  const ingresoEstimado = pesoKg * precioKg;

  const totalIngresos = (ventas as any[]).reduce((a: number, v: any) => a + v.ingresoTotal, 0);

  const resetForm = () => setFormData({ loteId: '', cantidadCerdos: '', pesoTotal: '', precio: '', fechaVenta: new Date().toISOString().split('T')[0], comprador: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.ventas.create({
        loteId: formData.loteId,
        cantidadCerdos: parseInt(formData.cantidadCerdos),
        pesoTotal,
        unidadPeso,
        precioPorKg: unidadPeso === 'kg' ? precio : undefined,
        precioPorLb: unidadPeso === 'lb' ? precio : undefined,
        fechaVenta: formData.fechaVenta,
        comprador: formData.comprador,
      });
      mutate();
      mutateLotes();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Error al registrar venta');
    }
  };

  const displayPeso = (v: any) => {
    if (v.unidadPeso === 'lb' && v.pesoTotalLb) return `${formatNumber(v.pesoTotalLb)} lb`;
    return `${formatNumber(v.pesoTotalKg ?? v.pesoTotal)} kg`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ventas</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Registro de ventas de cerdos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 self-start sm:self-auto">
          <IconPlus size={15} /> Nueva Venta
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Ingresos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalIngresos)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Ventas</p>
          <p className="text-2xl font-bold text-white mt-1">{(ventas as any[]).length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Cerdos Vendidos</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatNumber((ventas as any[]).reduce((a: number, v: any) => a + v.cantidadCerdos, 0))}
          </p>
        </div>
      </div>

      <Card>
        {(ventas as any[]).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead align="center">Cerdos</TableHead>
                  <TableHead align="center">Peso</TableHead>
                  <TableHead align="right">Total</TableHead>
                  <TableHead align="right"></TableHead>
                </TableRow>
              </thead>
              <TableBody>
                {(ventas as any[]).map((venta: any) => (
                  <TableRow key={venta._id}>
                    <TableCell className="text-zinc-400 text-sm">{formatDate(venta.fechaVenta)}</TableCell>
                    <TableCell className="font-medium text-white text-sm">{(venta.loteId as any)?.nombre}</TableCell>
                    <TableCell align="center">{formatNumber(venta.cantidadCerdos)}</TableCell>
                    <TableCell align="center" className="text-zinc-300 text-sm">{displayPeso(venta)}</TableCell>
                    <TableCell align="right" className="text-green-400 font-medium">{formatCurrency(venta.ingresoTotal)}</TableCell>
                    <TableCell align="right">
                      <Button variant="ghost" size="sm" onClick={async () => { if (confirm('¿Eliminar venta?')) { await api.ventas.delete(venta._id); mutate(); } }}>
                        <IconTrash size={13} className="text-zinc-500 hover:text-red-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-400">
            <IconTrendingUp size={40} className="mx-auto mb-3 text-zinc-700" />
            <p>No hay ventas registradas</p>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title="Registrar Venta" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Lote" value={formData.loteId} onChange={(e) => setFormData({ ...formData, loteId: e.target.value })} required>
            <option value="">Seleccionar lote...</option>
            {lotesActivos.map((l: any) => (
              <option key={l._id} value={l._id}>
                {l.nombre} — {new Date(l.fechaIngreso).toLocaleDateString('es-HN')} ({l.cantidadActual} animales)
              </option>
            ))}
          </Select>

          {/* Unidad de peso */}
          <div>
            <p className="block text-sm font-medium text-zinc-300 mb-1.5">Unidad de peso</p>
            <div className="flex gap-2">
              {(['kg', 'lb'] as const).map((u) => (
                <button key={u} type="button" onClick={() => setUnidadPeso(u)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${unidadPeso === u ? 'bg-green-700 border-green-600 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}>
                  {u === 'kg' ? 'Kilogramos (kg)' : 'Libras (lb)'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Cantidad de cerdos" type="number" value={formData.cantidadCerdos} onChange={(e) => setFormData({ ...formData, cantidadCerdos: e.target.value })} min="1" required />
            <Input label={`Peso total (${unidadPeso})`} type="number" value={formData.pesoTotal} onChange={(e) => setFormData({ ...formData, pesoTotal: e.target.value })} step="0.1" required />
          </div>
          <MoneyInput
            label={`Precio por ${unidadPeso}`}
            value={formData.precio}
            onChange={(hnlValue) => setFormData({ ...formData, precio: hnlValue })}
            required
          />

          {ingresoEstimado > 0 && (
            <div className="flex items-center justify-between p-4 bg-green-900/15 border border-green-900/40 rounded-lg">
              <div>
                <p className="text-sm text-green-300">Ingreso estimado</p>
                {unidadPeso === 'lb' && (
                  <p className="text-xs text-zinc-500 mt-0.5">{formatNumber(pesoKg)} kg · L {formatNumber(precioKg)}/kg</p>
                )}
              </div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(ingresoEstimado)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha" type="date" value={formData.fechaVenta} onChange={(e) => setFormData({ ...formData, fechaVenta: e.target.value })} required />
            <Input label="Comprador" value={formData.comprador} onChange={(e) => setFormData({ ...formData, comprador: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar Venta</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
