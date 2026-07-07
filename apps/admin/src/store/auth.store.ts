import { create } from 'zustand';

export interface Admin {
    id: string;
    name: string;
    email: string;
    role?: string;
}

interface AuthState {
    admin: Admin | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (admin: Admin, token: string) => void;
    logout: () => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    admin: null,
    token: null,
    isAuthenticated: false,
    
    login: (admin, token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_data', JSON.stringify(admin));
        }
        set({ admin, token, isAuthenticated: true });
    },
    
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_data');
        }
        set({ admin: null, token: null, isAuthenticated: false });
    },
    
    hydrate: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admin_token');
            const adminStr = localStorage.getItem('admin_data');
            
            if (token && adminStr) {
                try {
                    const admin = JSON.parse(adminStr);
                    set({ admin, token, isAuthenticated: true });
                } catch (e) {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_data');
                }
            }
        }
    },
}));


