'use client';

import { useState, useEffect } from 'react';

export function ConnectionStatus() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch('/api/moneda/tipo-cambio', { signal: ctrl.signal });
        clearTimeout(t);
        setOnline(res.ok);
      } catch {
        setOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  if (online === null || online === true) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-red-900/95 border border-red-700 rounded-lg px-4 py-3 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-2.5">
        <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 animate-pulse flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-100">Sin conexión al servidor</p>
          <p className="text-xs text-red-200/80 mt-0.5">El backend no responde. Verifica que esté corriendo en el puerto 3001.</p>
        </div>
      </div>
    </div>
  );
}
