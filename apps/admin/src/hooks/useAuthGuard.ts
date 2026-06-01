import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';

export const useAuthGuard = () => {
    const { isAuthenticated, hydrate } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Hydrate store from localStorage on mount
        hydrate();
        setIsHydrated(true);
    }, [hydrate]);

    useEffect(() => {
        // Once hydration is complete, check if authenticated
        if (isHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isHydrated, isAuthenticated, router]);

    return { isHydrated, isAuthenticated };
};
