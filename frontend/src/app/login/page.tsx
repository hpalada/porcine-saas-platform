'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PigLogo } from '@/components/icons';

type View = 'login' | 'registro' | 'solicitarPin' | 'verificarPin' | 'nuevaContraseña';

function IconGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  const [view, setView] = useState<View>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [form, setForm] = useState({ email: '', contraseña: '', nombreEmpresa: '', nombreUsuario: '', ubicacion: '', pin: '', nuevaContraseña: '' });
  const change = (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  useEffect(() => {
    const err = params.get('error');
    if (err) setError(decodeURIComponent(err));
  }, [params]);

  const post = async (url: string, body: object) => {
    let res: Response;
    try {
      res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } catch {
      throw new Error('No se puede conectar con el servidor. Verifica que el backend esté corriendo.');
    }
    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new Error('Respuesta inválida del servidor.');
    }
    if (!res.ok) throw new Error(data.error || data.message || 'Error');
    return data;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const data = await post('/api/auth/login', { email: form.email, contraseña: form.contraseña });
      setAuth(data.usuario, data.token);
      router.push('/');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const data = await post('/api/auth/registrarse', { nombreEmpresa: form.nombreEmpresa, nombreUsuario: form.nombreUsuario, email: form.email, contraseña: form.contraseña, ubicacion: form.ubicacion });
      setAuth(data.usuario, data.token);
      router.push('/');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  };

  const handleSolicitarPin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await post('/api/auth/solicitar-reset', { email: form.email });
      setSuccessMsg('Si el correo existe recibirás un PIN de 6 dígitos.');
      setView('verificarPin');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  };

  const handleVerificarPin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccessMsg('');
    try {
      const data = await post('/api/auth/verificar-pin', { email: form.email, pin: form.pin });
      setResetToken(data.resetToken);
      setView('nuevaContraseña');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  };

  const handleNuevaContraseña = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await post('/api/auth/nueva-contrasena', { resetToken, nuevaContraseña: form.nuevaContraseña });
      setSuccessMsg('Contraseña actualizada. Ahora puedes iniciar sesión.');
      setView('login');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  };

  const handleGoogle = () => { window.location.href = '/api/auth/google'; };

  const titles: Record<View, string> = {
    login: 'Iniciar Sesión',
    registro: 'Crear Cuenta',
    solicitarPin: 'Recuperar Contraseña',
    verificarPin: 'Ingresa el PIN',
    nuevaContraseña: 'Nueva Contraseña',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3 shadow-lg shadow-black/30 ring-1 ring-zinc-700">
              <PigLogo size={44} />
            </div>
            <h1 className="text-xl font-bold text-white">Porcine SaaS</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Gestión de granjas porcinas</p>
          </div>

          {/* Tabs login/registro */}
          {(view === 'login' || view === 'registro') && (
            <div className="flex gap-1.5 p-1 bg-zinc-800 rounded-xl mb-6">
              <button onClick={() => { setView('login'); setError(''); }} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${view === 'login' ? 'bg-green-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>
                Iniciar Sesión
              </button>
              <button onClick={() => { setView('registro'); setError(''); }} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${view === 'registro' ? 'bg-green-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>
                Crear Cuenta
              </button>
            </div>
          )}

          {/* Back button for password reset flow */}
          {(view === 'solicitarPin' || view === 'verificarPin' || view === 'nuevaContraseña') && (
            <div className="mb-5">
              <button onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }} className="text-sm text-zinc-400 hover:text-white flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Volver al login
              </button>
              <h2 className="text-base font-semibold text-white mt-3">{titles[view]}</h2>
            </div>
          )}

          {error && <div className="mb-4 p-3 rounded-xl bg-red-900/20 border border-red-800 text-red-400 text-sm">{error}</div>}
          {successMsg && <div className="mb-4 p-3 rounded-xl bg-green-900/20 border border-green-800 text-green-400 text-sm">{successMsg}</div>}

          {/* LOGIN */}
          {view === 'login' && (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input label="Correo Electrónico" name="email" type="email" value={form.email} onChange={change} required />
                <Input label="Contraseña" name="contraseña" type="password" value={form.contraseña} onChange={change} required />
                <div className="flex justify-end">
                  <button type="button" onClick={() => { setView('solicitarPin'); setError(''); }} className="text-xs text-zinc-500 hover:text-green-400 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Verificando...</span> : 'Iniciar Sesión'}
                </Button>
              </form>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600">o continúa con</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-medium text-white transition-colors"
              >
                <IconGoogle />
                Continuar con Google
              </button>
            </>
          )}

          {/* REGISTRO */}
          {view === 'registro' && (
            <>
              <form onSubmit={handleRegistro} className="space-y-4">
                <Input label="Nombre de la Empresa" name="nombreEmpresa" value={form.nombreEmpresa} onChange={change} required />
                <Input label="Tu Nombre" name="nombreUsuario" value={form.nombreUsuario} onChange={change} required />
                <Input label="Ubicación" name="ubicacion" value={form.ubicacion} onChange={change} />
                <Input label="Correo Electrónico" name="email" type="email" value={form.email} onChange={change} required />
                <Input label="Contraseña" name="contraseña" type="password" value={form.contraseña} onChange={change} minLength={6} required />
                <p className="text-xs text-zinc-500 text-center">Al crear tu cuenta tendrás acceso inmediato al sistema.</p>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Creando cuenta...</span> : 'Crear Cuenta'}
                </Button>
              </form>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600">o regístrate con</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-medium text-white transition-colors"
              >
                <IconGoogle />
                Registrarse con Google
              </button>
            </>
          )}

          {/* SOLICITAR PIN */}
          {view === 'solicitarPin' && (
            <form onSubmit={handleSolicitarPin} className="space-y-4">
              <p className="text-sm text-zinc-400">Ingresa tu correo y te enviaremos un código de 6 dígitos.</p>
              <Input label="Correo Electrónico" name="email" type="email" value={form.email} onChange={change} required />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Enviando...' : 'Enviar PIN'}
              </Button>
            </form>
          )}

          {/* VERIFICAR PIN */}
          {view === 'verificarPin' && (
            <form onSubmit={handleVerificarPin} className="space-y-4">
              <p className="text-sm text-zinc-400">Ingresa el PIN de 6 dígitos enviado a <strong className="text-white">{form.email}</strong></p>
              <input
                name="pin"
                value={form.pin}
                onChange={change}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-3xl font-bold tracking-[0.5em] text-center text-white placeholder-zinc-600 focus:outline-none focus:border-green-500"
                required
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Verificando...' : 'Verificar PIN'}
              </Button>
              <button type="button" onClick={() => { setView('solicitarPin'); setError(''); }} className="w-full text-xs text-zinc-500 hover:text-zinc-300">
                No recibí el PIN — reenviar
              </button>
            </form>
          )}

          {/* NUEVA CONTRASEÑA */}
          {view === 'nuevaContraseña' && (
            <form onSubmit={handleNuevaContraseña} className="space-y-4">
              <Input label="Nueva Contraseña" name="nuevaContraseña" type="password" value={form.nuevaContraseña} onChange={change} minLength={6} required />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Guardando...' : 'Guardar Contraseña'}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">Porcine SaaS &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
