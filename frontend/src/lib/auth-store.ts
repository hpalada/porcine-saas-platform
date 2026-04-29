import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'administrador' | 'empleado';
  empresa: {
    id: string;
    nombre: string;
    ubicacion?: string;
    contacto?: string;
    email?: string;
  };
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  
  setAuth: (usuario: Usuario, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      isAuthenticated: false,

      setAuth: (usuario, token) => {
        set({
          usuario,
          token,
          isAuthenticated: true,
        });
        localStorage.setItem('auth_token', token);
      },

      logout: () => {
        set({
          usuario: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('auth_token');
      },

      setToken: (token) => {
        set({ token });
        localStorage.setItem('auth_token', token);
      },
    }),
    {
      name: 'porcine-auth',
    }
  )
);
