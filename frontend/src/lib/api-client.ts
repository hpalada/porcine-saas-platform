const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const auth = localStorage.getItem('porcine-auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed?.state?.token || null;
    }
  } catch {
    return localStorage.getItem('auth_token');
  }
  return null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('porcine-auth');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    throw new Error('Sesión expirada');
  }
  if (response.status === 403) {
    const body = await response.json().catch(() => ({ error: 'Acceso denegado' }));
    if (typeof window !== 'undefined') {
      localStorage.removeItem('porcine-auth');
      localStorage.removeItem('auth_token');
      const msg = encodeURIComponent(body.error || 'Tu acceso ha sido suspendido.');
      window.location.href = `/login?error=${msg}`;
    }
    throw new Error(body.error || 'Acceso denegado');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la petición' }));
    throw new Error(error.error || error.message || 'Error en la petición');
  }
  return response.json();
}

async function safeFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (e) {
    throw new Error('No se puede conectar con el servidor. Verifica que el backend esté corriendo.');
  }
}

export const api = {
  lotes: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return safeFetch(`${API_BASE}/lotes${qs}`, { headers: authHeaders() }).then(handleResponse);
    },
    get: (id: string) => safeFetch(`${API_BASE}/lotes/${id}`, { headers: authHeaders() }).then(handleResponse),
    create: (data: any) => safeFetch(`${API_BASE}/lotes`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    update: (id: string, data: any) => safeFetch(`${API_BASE}/lotes/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: string) => safeFetch(`${API_BASE}/lotes/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
    resumen: (id: string) => safeFetch(`${API_BASE}/lotes/${id}/resumen`, { headers: authHeaders() }).then(handleResponse),
    stats: () => safeFetch(`${API_BASE}/lotes/stats`, { headers: authHeaders() }).then(handleResponse),
  },

  notas: {
    porLote: (loteId: string) => safeFetch(`${API_BASE}/notas/lote/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    create: (data: any) => safeFetch(`${API_BASE}/notas`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: string) => safeFetch(`${API_BASE}/notas/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  },

  concentrados: {
    list: () => safeFetch(`${API_BASE}/concentrados`, { headers: authHeaders() }).then(handleResponse),
    get: (id: string) => safeFetch(`${API_BASE}/concentrados/${id}`, { headers: authHeaders() }).then(handleResponse),
    create: (data: any) => safeFetch(`${API_BASE}/concentrados`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    update: (id: string, data: any) => safeFetch(`${API_BASE}/concentrados/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: string) => safeFetch(`${API_BASE}/concentrados/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  },

  inventario: {
    stockActual: () => safeFetch(`${API_BASE}/inventario`, { headers: authHeaders() }).then(handleResponse),
    historial: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return safeFetch(`${API_BASE}/inventario/historial${qs}`, { headers: authHeaders() }).then(handleResponse);
    },
    compra: (data: any) => safeFetch(`${API_BASE}/inventario/compra`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    ajuste: (data: any) => safeFetch(`${API_BASE}/inventario/ajuste`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  },

  consumos: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return safeFetch(`${API_BASE}/consumos${qs}`, { headers: authHeaders() }).then(handleResponse);
    },
    porLote: (loteId: string) => safeFetch(`${API_BASE}/consumos/lote/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    resumen: (loteId: string) => safeFetch(`${API_BASE}/consumos/resumen/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    create: (data: any) => safeFetch(`${API_BASE}/consumos`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: string) => safeFetch(`${API_BASE}/consumos/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  },

  gastos: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return safeFetch(`${API_BASE}/gastos${qs}`, { headers: authHeaders() }).then(handleResponse);
    },
    create: (data: any) => safeFetch(`${API_BASE}/gastos`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    update: (id: string, data: any) => safeFetch(`${API_BASE}/gastos/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: string) => safeFetch(`${API_BASE}/gastos/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  },

  ventas: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return safeFetch(`${API_BASE}/ventas${qs}`, { headers: authHeaders() }).then(handleResponse);
    },
    create: (data: any) => safeFetch(`${API_BASE}/ventas`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: string) => safeFetch(`${API_BASE}/ventas/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  },

  vacunaciones: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return safeFetch(`${API_BASE}/vacunaciones${qs}`, { headers: authHeaders() }).then(handleResponse);
    },
    porLote: (loteId: string) => safeFetch(`${API_BASE}/vacunaciones/lote/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    create: (data: any) => safeFetch(`${API_BASE}/vacunaciones`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    update: (id: string, data: any) => safeFetch(`${API_BASE}/vacunaciones/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: string) => safeFetch(`${API_BASE}/vacunaciones/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  },

  reportes: {
    dashboard: () => safeFetch(`${API_BASE}/reportes/dashboard`, { headers: authHeaders() }).then(handleResponse),
    rentabilidad: (loteId: string) => safeFetch(`${API_BASE}/reportes/rentabilidad/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    resumenCompleto: (loteId: string) => safeFetch(`${API_BASE}/reportes/resumen-completo/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    consumoDiario: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return safeFetch(`${API_BASE}/reportes/consumo-diario${qs}`, { headers: authHeaders() }).then(handleResponse);
    },
    costoAcumulado: (loteId: string) => safeFetch(`${API_BASE}/reportes/costo-acumulado/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    exportar: (loteId: string, formato: 'excel' | 'pdf' = 'excel') =>
      safeFetch(`${API_BASE}/reportes/exportar/${loteId}?formato=${formato}`, { headers: authHeaders() }).then(r => r.blob()),
    porFecha: (params: { fechaDesde?: string; fechaHasta?: string }) => {
      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
      return safeFetch(`${API_BASE}/reportes/por-fecha${qs ? '?' + qs : ''}`, { headers: authHeaders() }).then(handleResponse);
    },
  },

  // ============== OTROS CONSUMOS ==============
  otrosConsumos: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return safeFetch(`${API_BASE}/otros-consumos${qs}`, { headers: authHeaders() }).then(handleResponse);
    },
    porLote: (loteId: string) => safeFetch(`${API_BASE}/otros-consumos/lote/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    resumenPorLote: (loteId: string) => safeFetch(`${API_BASE}/otros-consumos/resumen/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    create: (data: any) => safeFetch(`${API_BASE}/otros-consumos`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    update: (id: string, data: any) => safeFetch(`${API_BASE}/otros-consumos/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: string) => safeFetch(`${API_BASE}/otros-consumos/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  },

  // ============== MORTALIDADES ==============
  mortalidades: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return safeFetch(`${API_BASE}/mortalidades${qs}`, { headers: authHeaders() }).then(handleResponse);
    },
    porLote: (loteId: string) => safeFetch(`${API_BASE}/mortalidades/lote/${loteId}`, { headers: authHeaders() }).then(handleResponse),
    crear: (data: any) => safeFetch(`${API_BASE}/mortalidades`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    actualizar: (id: string, data: any) => safeFetch(`${API_BASE}/mortalidades/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    eliminar: (id: string) => safeFetch(`${API_BASE}/mortalidades/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  },

  // ============== EMPRESA ==============
  empresa: {
    get: () => safeFetch(`${API_BASE}/empresa`, { headers: authHeaders() }).then(handleResponse),
    update: (data: any) => safeFetch(`${API_BASE}/empresa`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    cancelarSuscripcion: () => safeFetch(`${API_BASE}/empresa/cancelar-suscripcion`, { method: 'POST', headers: authHeaders() }).then(handleResponse),
    reactivarSuscripcion: (empresaId: string) => safeFetch(`${API_BASE}/empresa/reactivar-suscripcion`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ empresaId }) }).then(handleResponse),
  },
};
