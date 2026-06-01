import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

export const useSetupCheck = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [adminExists, setAdminExists] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const response = await api.get('/auth/setup-status');
                const exists = response.data.adminExists;
                setAdminExists(exists);
                
                if (!exists) {
                    router.push('/setup');
                }
            } catch (error) {
                console.error("Failed to check setup status", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSetup();
    }, [router]);

    return { isLoading, adminExists };
};
