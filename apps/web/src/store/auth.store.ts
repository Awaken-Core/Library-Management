import { create } from 'zustand';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    
    login: (user, token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('student_token', token);
            localStorage.setItem('student_data', JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
    },
    
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('student_token');
            localStorage.removeItem('student_data');
        }
        set({ user: null, token: null, isAuthenticated: false });
    },
    
    hydrate: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('student_token');
            const userStr = localStorage.getItem('student_data');
            
            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    set({ user, token, isAuthenticated: true });
                } catch (e) {
                    localStorage.removeItem('student_token');
                    localStorage.removeItem('student_data');
                }
            }
        }
    },
}));
