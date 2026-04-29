import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SuperAdminState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, email: string) => void;
  logout: () => void;
}

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      isAuthenticated: false,
      setAuth: (token, email) => set({ token, email, isAuthenticated: true }),
      logout: () => set({ token: null, email: null, isAuthenticated: false }),
    }),
    { name: 'porcine-superadmin' }
  )
);

export function getSuperAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem('porcine-superadmin');
    return s ? JSON.parse(s)?.state?.token || null : null;
  } catch { return null; }
}

export async function saFetch(path: string, options?: RequestInit) {
  const token = getSuperAdminToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error' }));
    throw new Error(err.error || 'Error en la petición');
  }
  return res.json();
}
