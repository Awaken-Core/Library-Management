import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyBorrows, requestBorrow, cancelBorrowRequest } from '../../api/borrows.api';

export const useMyBorrowsQuery = () => {
    return useQuery({
        queryKey: ['borrows', 'my'],
        queryFn: getMyBorrows,
    });
};

export const useBorrowBookMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: requestBorrow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['borrows', 'my'] });
            queryClient.invalidateQueries({ queryKey: ['books'] });
        },
    });
};

export const useCancelBorrowMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelBorrowRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['borrows', 'my'] });
        },
    });
};
