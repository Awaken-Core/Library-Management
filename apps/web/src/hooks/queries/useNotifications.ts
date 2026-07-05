import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const useNotificationsQuery = (isAuthenticated: boolean) => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications');
            return data.data;
        },
        refetchInterval: 30000, // Poll every 30 seconds
        enabled: isAuthenticated, // Only fetch if user is logged in
    });
};

export const useMarkNotificationReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => await api.patch(`/notifications/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkAllNotificationsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => await api.patch('/notifications/read-all'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
