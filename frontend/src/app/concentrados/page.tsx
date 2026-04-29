'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IconWheat, IconPlus, IconEdit, IconTrash, IconPackage } from '@/components/icons';

const KG_PER_LB = 0.453592;

export default function ConcentradosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConcentrado, setEditingConcentrado] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precioActual: '' });
  const [precioMode, setPrecioMode] = useState<'unitario' | 'total'>('unitario');
  const [precioTotal, setPrecioTotal] = useState('');
  const [cantidadBolsas, setCantidadBolsas] = useState('1');
  const [pesoPorSaco, setPesoPorSaco] = useState('50');
  const [unidadPeso, setUnidadPeso] = useState<'kg' | 'lb'>('kg');

  const { data: concentrados = [], mutate } = useSWR('/api/concentrados', () => api.concentrados.list());

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Concentrados</h1>
          <p className="text-sm mt-0.5 text-zinc-400">Tipos de alimento y precios por fase</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2 self-start sm:self-auto">
          <IconPlus size={15} /> Nuevo Concentrado
        </Button>
      </div>

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
