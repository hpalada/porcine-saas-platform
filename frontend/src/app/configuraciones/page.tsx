'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconBuilding, IconBell, IconSun, IconDollar, IconUser, IconRefresh } from '@/components/icons';
import { useAuthStore } from '@/lib/auth-store';
import { useThemeStore } from '@/lib/theme-store';

function getAuthHeader(): Record<string, string> {
  try {
    const s = localStorage.getItem('porcine-auth');
    const token = s ? JSON.parse(s)?.state?.token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch { return {}; }
}

export default function ConfiguracionesPage() {
  const { usuario } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    nombreGranja: '',
    ubicacion: '',
    contacto: '',
    email: '',
    moneda: 'HNL',
    tasaCambio: 0,
    notificacionesActivas: true,
    alertaStockBajo: true,
    nivelStockCritico: 50,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/empresa', { headers: getAuthHeader() });
        if (res.ok) {
          const empresa = await res.json();
          setForm(prev => ({
            ...prev,
            nombreGranja: empresa.nombre || '',
            ubicacion: empresa.ubicacion || '',
            contacto: empresa.contacto || '',
            email: empresa.email || usuario?.email || '',
            notificacionesActivas: typeof empresa.notificacionesActivas === 'boolean' ? empresa.notificacionesActivas : prev.notificacionesActivas,
            alertaStockBajo: typeof empresa.alertaStockBajo === 'boolean' ? empresa.alertaStockBajo : prev.alertaStockBajo,
            nivelStockCritico: typeof empresa.nivelStockCritico === 'number' ? empresa.nivelStockCritico : prev.nivelStockCritico,
          }));
        } else {
          setForm(prev => ({
            ...prev,
            nombreGranja: usuario?.empresa?.nombre || '',
            email: usuario?.email || '',
            ubicacion: usuario?.empresa?.ubicacion || '',
            contacto: usuario?.empresa?.contacto || '',
          }));
        }
      } catch {
        setForm(prev => ({
          ...prev,
          nombreGranja: usuario?.empresa?.nombre || '',
          email: usuario?.email || '',
        }));
      }
    };
    load();
    fetchExchangeRate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      const res = await fetch('/api/moneda/tipo-cambio');
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, tasaCambio: data.rate ?? prev.tasaCambio }));
      }
    } catch { /* keep current value */ }
    finally { setIsLoadingRate(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          nombre: form.nombreGranja,
          ubicacion: form.ubicacion,
          contacto: form.contacto,
          notificacionesActivas: form.notificacionesActivas,
          alertaStockBajo: form.alertaStockBajo,
          nivelStockCritico: form.nivelStockCritico,
        }),
      });
      if (!res.ok) throw new Error();
      setMsg({ type: 'success', text: 'Configuración guardada.' });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: 'error', text: 'Error al guardar la configuración.' });
    } finally {
      setIsSaving(false);
    }
  };

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-800">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 bg-zinc-800">{icon}</div>
      <h2 className="text-base font-semibold text-white">{title}</h2>
    </div>
  );

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-green-600' : 'bg-zinc-700'}`}
        style={{ width: 40, height: 22 }}
      >
        <span className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`}
          style={{ width: 18, height: 18 }} />
      </button>
    </label>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Configuración</h1>
        <p className="text-sm mt-0.5 text-zinc-400">Personaliza el sistema para tu granja</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border text-sm ${msg.type === 'success' ? 'bg-green-900/15 border-green-800 text-green-400' : 'bg-red-900/15 border-red-800 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      {/* Cuenta */}
      {usuario && (
        <Card>
          <SectionHeader icon={<IconUser size={15} />} title="Cuenta" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide mb-1 text-zinc-500">Usuario</p>
              <p className="font-medium text-white">{usuario.nombre}</p>
              <p className="text-sm text-zinc-400">{usuario.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1 text-zinc-500">Empresa</p>
              <p className="font-medium text-white">{usuario.empresa?.nombre}</p>
              <p className="text-sm capitalize text-zinc-400">{usuario.rol}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Apariencia */}
      <Card>
        <SectionHeader icon={<IconSun size={15} />} title="Apariencia" />
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium text-white">Tema</p>
            <p className="text-xs mt-0.5 text-zinc-500">Cambia el fondo entre oscuro y claro</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
            >
              Oscuro
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
            >
              Claro
            </button>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Información de la Granja */}
        <Card>
          <SectionHeader icon={<IconBuilding size={15} />} title="Información de la Granja" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre de la Granja" value={form.nombreGranja} onChange={(e) => setForm({ ...form, nombreGranja: e.target.value })} required />
            <Input label="Ubicación" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
            <Input label="Contacto" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
            <Input label="Correo" type="email" value={form.email} disabled className="opacity-60 cursor-not-allowed" />
          </div>
        </Card>

        {/* Moneda */}
        <Card>
          <SectionHeader icon={<IconDollar size={15} />} title="Moneda" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="block text-sm font-medium mb-1.5 text-zinc-300">Moneda Principal</p>
              <select
                value={form.moneda}
                onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors bg-zinc-900 border-zinc-700 text-white"
              >
                <option value="HNL">HNL — Lempira Hondureño</option>
                <option value="USD">USD — Dólar Estadounidense</option>
              </select>
            </div>
            <div>
              <p className="block text-sm font-medium mb-1.5 text-zinc-300">Tasa de Cambio (USD → HNL)</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={form.tasaCambio}
                  onChange={(e) => setForm({ ...form, tasaCambio: parseFloat(e.target.value) })}
                  step="0.01"
                  min="0"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={fetchExchangeRate}
                  disabled={isLoadingRate}
                  className="px-3 rounded-lg border transition-colors flex items-center gap-1.5 text-sm border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                  title="Actualizar tasa de cambio"
                >
                  <IconRefresh size={14} className={isLoadingRate ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Alertas */}
        <Card>
          <SectionHeader icon={<IconBell size={15} />} title="Notificaciones" />
          <div className="space-y-1 divide-y divide-zinc-800/50">
            <Toggle checked={form.notificacionesActivas} onChange={(v) => setForm({ ...form, notificacionesActivas: v })} label="Activar notificaciones" />
            <Toggle checked={form.alertaStockBajo} onChange={(v) => setForm({ ...form, alertaStockBajo: v })} label="Alerta de stock bajo" />
            {form.alertaStockBajo && (
              <div className="pt-3">
                <Input
                  label="Avisarme cuando el stock esté por debajo de"
                  type="number"
                  value={form.nivelStockCritico}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setForm({ ...form, nivelStockCritico: Number.isFinite(v) ? v : 0 });
                  }}
                  min="0"
                />
                <p className="text-xs mt-1 text-zinc-500">
                  Se notificará en el dashboard cuando un concentrado tenga menos de esta cantidad disponible.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </div>
  );
}
