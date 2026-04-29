'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { IconAlertCircle, IconCheckCircle, IconArrowLeft } from '@/components/icons';

export default function NuevoConsumoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockDisponible, setStockDisponible] = useState<number | null>(null);

  const { data: lotes = [] } = useSWR('/api/lotes', () => api.lotes.list());
  const { data: concentrados = [] } = useSWR('/api/concentrados', () => api.concentrados.list());
  const { data: inventario = [] } = useSWR('/api/inventario', () => api.inventario.stockActual());

  const [formData, setFormData] = useState({
    loteId: '',
    concentradoTipoId: '',
    cantidad: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  useEffect(() => {
    if (formData.concentradoTipoId && inventario) {
      const item = (inventario as any[]).find((i: any) => i._id === formData.concentradoTipoId);
      setStockDisponible(item?.stock ?? 0);
    } else {
      setStockDisponible(null);
    }
  }, [formData.concentradoTipoId, inventario]);

  const concentradoSel = (concentrados as any[]).find((c: any) => c._id === formData.concentradoTipoId);
  const cantidadNum = parseFloat(formData.cantidad) || 0;
  const costoEstimado = concentradoSel ? cantidadNum * concentradoSel.precioActual : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (stockDisponible !== null && cantidadNum > stockDisponible) {
        setError(`Stock insuficiente. Disponible: ${stockDisponible} ${concentradoSel?.unidad || 'unidades'}`);
        setLoading(false);
        return;
      }
      await api.consumos.create({ ...formData, cantidad: cantidadNum });
      router.push('/consumos');
    } catch (err: any) {
      setError(err.message || 'Error al registrar consumo');
      setLoading(false);
    }
  };

  const lotesActivos = (lotes as any[]).filter((l: any) => l.estado === 'activo');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <IconArrowLeft size={15} />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Registrar Consumo</h1>
          <p className="text-zinc-400 text-sm">Consumo de concentrado por lote</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Lote" value={formData.loteId} onChange={(e) => setFormData({ ...formData, loteId: e.target.value })} required>
            <option value="">Seleccionar lote...</option>
            {lotesActivos.map((l: any) => (
              <option key={l._id} value={l._id}>{l.nombre} ({l.cantidadActual} animales)</option>
            ))}
          </Select>

          <Select label="Tipo de Concentrado" value={formData.concentradoTipoId} onChange={(e) => setFormData({ ...formData, concentradoTipoId: e.target.value })} required>
            <option value="">Seleccionar concentrado...</option>
            {(concentrados as any[]).map((c: any) => (
              <option key={c._id} value={c._id}>{c.nombre} — {formatCurrency(c.precioActual)}/{c.unidad}</option>
            ))}
          </Select>

          {stockDisponible !== null && (
            <div className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
              stockDisponible < 10
                ? 'bg-red-900/15 border-red-800 text-red-400'
                : stockDisponible < 20
                ? 'bg-yellow-900/15 border-yellow-800 text-yellow-400'
                : 'bg-green-900/15 border-green-800 text-green-400'
            }`}>
              <span>Stock disponible</span>
              <div className="flex items-center gap-1.5 font-medium">
                {stockDisponible < 20 ? <IconAlertCircle size={14} /> : <IconCheckCircle size={14} />}
                {stockDisponible} {concentradoSel?.unidad || 'unidades'}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Cantidad (${concentradoSel?.unidad || 'unidades'})`}
              type="number"
              value={formData.cantidad}
              onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
              placeholder="0"
              min="0.1"
              step="0.1"
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

          {costoEstimado > 0 && (
            <div className="flex items-center justify-between p-4 bg-green-900/15 border border-green-900/40 rounded-lg">
              <div>
                <p className="text-xs text-green-300 mb-0.5">Costo estimado</p>
                <p className="text-xs text-green-400/60">{formData.cantidad} × {formatCurrency(concentradoSel?.precioActual || 0)}</p>
              </div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(costoEstimado)}
              </div>
            </div>
          )}

          <Input
            label="Observaciones (opcional)"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            placeholder=""
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/15 border border-red-900/40 rounded-lg text-red-400 text-sm">
              <IconAlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Registrando...' : 'Registrar Consumo'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
