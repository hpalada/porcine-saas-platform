'use client';

import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { api } from '@/lib/api-client';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { IconPlus, IconUtensils, IconTrash } from '@/components/icons';

export default function ConsumosPage() {
  const { data: consumos = [], mutate } = useSWR('/api/consumos?limite=50', () => api.consumos.list({ limite: '50' }));

  const totalCosto = (consumos as any[]).reduce((a: number, c: any) => a + c.costoTotal, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Consumos</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Historial de consumo de concentrado</p>
        </div>
        <Link href="/consumos/nuevo">
          <Button className="flex items-center gap-2">
            <IconPlus size={15} />
            Nuevo Consumo
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Costo Total</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalCosto)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Registros</p>
          <p className="text-2xl font-bold text-white mt-1">{(consumos as any[]).length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Sacos</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatNumber((consumos as any[]).reduce((a: number, c: any) => a + c.cantidad, 0))}
          </p>
        </div>
      </div>

      <Card>
        {(consumos as any[]).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead className="hidden sm:table-cell">Concentrado</TableHead>
                <TableHead align="center">Cantidad</TableHead>
                <TableHead className="hidden md:table-cell" align="right">Precio Unit.</TableHead>
                <TableHead align="right">Costo Total</TableHead>
                <TableHead align="right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(consumos as any[]).map((consumo: any) => (
                <TableRow key={consumo._id}>
                  <TableCell className="text-zinc-400 text-sm">{formatDate(consumo.fecha)}</TableCell>
                  <TableCell className="font-medium text-white text-sm">{(consumo.loteId as any)?.nombre || '—'}</TableCell>
                  <TableCell className="hidden sm:table-cell text-zinc-300 text-sm">{(consumo.concentradoTipoId as any)?.nombre || '—'}</TableCell>
                  <TableCell align="center">{formatNumber(consumo.cantidad)}</TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400" align="right">{formatCurrency(consumo.precioUnitario)}</TableCell>
                  <TableCell align="right" className="text-green-400 font-medium">{formatCurrency(consumo.costoTotal)}</TableCell>
                  <TableCell align="right">
                    <Button variant="ghost" size="sm" onClick={async () => { if (confirm('¿Eliminar registro?')) { await api.consumos.delete(consumo._id); mutate(); } }}>
                      <IconTrash size={13} className="text-zinc-500 hover:text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16 text-zinc-400">
            <IconUtensils size={40} className="mx-auto mb-3 text-zinc-700" />
            <p>No hay consumos registrados</p>
          </div>
        )}
      </Card>
    </div>
  );
}
