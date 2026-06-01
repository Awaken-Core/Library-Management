import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';

export const useAuthGuard = () => {
    const { isAuthenticated, hydrate, user } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        hydrate();
        setIsHydrated(true);
    }, [hydrate]);

    useEffect(() => {
        if (isHydrated) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'USER') {
                // If they have an admin token but are on the student portal, reject them.
                // Admin portal is for admins, Student portal is for students.
                router.push('/login');
            }
        }
    }, [isHydrated, isAuthenticated, user, router]);

    return { isHydrated, isAuthenticated: isAuthenticated && user?.role === 'USER' };
};
