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
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { IconClipboard, IconPlus, IconPackage, IconWeight } from '@/components/icons';

export default function InventarioPage() {
  const [isCompraOpen, setIsCompraOpen] = useState(false);
  const [isAjusteOpen, setIsAjusteOpen] = useState(false);
  const [compraData, setCompraData] = useState({ concentradoTipoId: '', cantidad: '', motivo: 'Compra de concentrado' });
  const [ajusteData, setAjusteData] = useState({ concentradoTipoId: '', cantidad: '', motivo: '' });

  const { data: stock = [], mutate: mutateStock } = useSWR('/api/inventario', () => api.inventario.stockActual());
  const { data: concentrados = [] } = useSWR('/api/concentrados', () => api.concentrados.list());
  const { data: historial = [], mutate: mutateHistorial } = useSWR('/api/inventario/historial?limite=20', () => api.inventario.historial({ limite: '20' }));

  const handleCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.inventario.compra({ ...compraData, cantidad: parseFloat(compraData.cantidad) });
      mutateStock(); mutateHistorial();
      setIsCompraOpen(false);
      setCompraData({ concentradoTipoId: '', cantidad: '', motivo: 'Compra de concentrado' });
    } catch (error: any) { alert(error.message); }
  };

  const handleAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.inventario.ajuste({ ...ajusteData, cantidad: parseFloat(ajusteData.cantidad) });
      mutateStock(); mutateHistorial();
      setIsAjusteOpen(false);
      setAjusteData({ concentradoTipoId: '', cantidad: '', motivo: '' });
    } catch (error: any) { alert(error.message); }
  };

  const getStockVariant = (s: number) => s < 10 ? 'danger' : s < 20 ? 'cancelado' : 'active';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Inventario</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Control de stock de concentrados</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setIsAjusteOpen(true)}>Ajuste</Button>
          <Button onClick={() => setIsCompraOpen(true)} className="flex items-center gap-2">
            <IconPlus size={15} /> Registrar Compra
          </Button>
        </div>
      </div>

      <Card title="Stock Actual">
        {(stock as any[]).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concentrado</TableHead>
                <TableHead className="hidden sm:table-cell" align="center">Unidad</TableHead>
                <TableHead align="center">Stock</TableHead>
                <TableHead className="hidden md:table-cell" align="right">Entradas</TableHead>
                <TableHead className="hidden md:table-cell" align="right">Salidas</TableHead>
                <TableHead align="right">Precio</TableHead>
                <TableHead className="hidden sm:table-cell" align="right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(stock as any[]).map((item: any) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium text-white">{item.nombre}</TableCell>
                  <TableCell className="hidden sm:table-cell" align="center">
                    <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                      {item.unidad === 'saco' ? <IconPackage size={13} /> : <IconWeight size={13} />}
                      <span className="text-sm">{item.unidad}</span>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <Badge variant={getStockVariant(item.stock)}>{formatNumber(item.stock)}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-green-400 text-sm" align="right">+{formatNumber(item.entradas)}</TableCell>
                  <TableCell className="hidden md:table-cell text-red-400 text-sm" align="right">-{formatNumber(item.salidas)}</TableCell>
                  <TableCell align="right" className="text-zinc-300 text-sm">{formatCurrency(item.precioActual)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-white font-medium" align="right">{formatCurrency(item.stock * item.precioActual)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-zinc-400">
            <IconClipboard size={40} className="mx-auto mb-3 text-zinc-700" />
            <p>No hay inventario registrado</p>
          </div>
        )}
      </Card>

      <Card title="Historial de Movimientos" description="Últimos 20 movimientos">
        {(historial as any[]).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Concentrado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead align="center">Cantidad</TableHead>
                <TableHead className="hidden md:table-cell" align="right">Stock Ant.</TableHead>
                <TableHead align="right">Stock Nuevo</TableHead>
                <TableHead className="hidden sm:table-cell">Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(historial as any[]).map((mov: any) => (
                <TableRow key={mov._id}>
                  <TableCell className="text-zinc-400 text-sm">{formatDate(mov.fecha)}</TableCell>
                  <TableCell className="font-medium text-white text-sm">{(mov.concentradoTipoId as any)?.nombre || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={mov.tipo === 'entrada' ? 'active' : mov.tipo === 'salida' ? 'cancelado' : 'default'}>
                      {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell align="center">{formatNumber(mov.cantidad)}</TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400" align="right">{formatNumber(mov.stockAnterior)}</TableCell>
                  <TableCell align="right" className="text-white font-medium">{formatNumber(mov.stockNuevo)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-zinc-400 text-sm">{mov.motivo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-zinc-400 text-sm py-4 text-center">No hay movimientos registrados</p>
        )}
      </Card>

      <Modal isOpen={isCompraOpen} onClose={() => setIsCompraOpen(false)} title="Registrar Compra">
        <form onSubmit={handleCompra} className="space-y-4">
          <Select label="Tipo de Concentrado" value={compraData.concentradoTipoId} onChange={(e) => setCompraData({ ...compraData, concentradoTipoId: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {(concentrados as any[]).map((c: any) => <option key={c._id} value={c._id}>{c.nombre}</option>)}
          </Select>
          <Input label="Cantidad" type="number" value={compraData.cantidad} onChange={(e) => setCompraData({ ...compraData, cantidad: e.target.value })} placeholder="100" min="1" required />
          <Input label="Motivo" value={compraData.motivo} onChange={(e) => setCompraData({ ...compraData, motivo: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCompraOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar Compra</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAjusteOpen} onClose={() => setIsAjusteOpen(false)} title="Ajuste de Inventario">
        <form onSubmit={handleAjuste} className="space-y-4">
          <Select label="Tipo de Concentrado" value={ajusteData.concentradoTipoId} onChange={(e) => setAjusteData({ ...ajusteData, concentradoTipoId: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {(concentrados as any[]).map((c: any) => <option key={c._id} value={c._id}>{c.nombre}</option>)}
          </Select>
          <Input label="Cantidad (positivo para agregar, negativo para quitar)" type="number" value={ajusteData.cantidad} onChange={(e) => setAjusteData({ ...ajusteData, cantidad: e.target.value })} placeholder="-5" required />
          <Input label="Motivo" value={ajusteData.motivo} onChange={(e) => setAjusteData({ ...ajusteData, motivo: e.target.value })} placeholder="" required />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAjusteOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar Ajuste</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
