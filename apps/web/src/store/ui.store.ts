import { create } from 'zustand';

interface UIState {
    isMobileMenuOpen: boolean;
    isNotificationsOpen: boolean;
    toggleMobileMenu: () => void;
    toggleNotifications: () => void;
    setMobileMenuOpen: (isOpen: boolean) => void;
    setNotificationsOpen: (isOpen: boolean) => void;
    closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isMobileMenuOpen: false,
    isNotificationsOpen: false,
    
    toggleMobileMenu: () => set((state) => ({ 
        isMobileMenuOpen: !state.isMobileMenuOpen, 
        isNotificationsOpen: false 
    })),
    
    toggleNotifications: () => set((state) => ({ 
        isNotificationsOpen: !state.isNotificationsOpen, 
        isMobileMenuOpen: false 
    })),
    
    setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
    setNotificationsOpen: (isOpen) => set({ isNotificationsOpen: isOpen }),
    
    closeAll: () => set({ 
        isMobileMenuOpen: false, 
        isNotificationsOpen: false 
    }),
}));
