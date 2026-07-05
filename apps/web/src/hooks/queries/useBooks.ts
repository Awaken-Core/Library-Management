import { useQuery } from '@tanstack/react-query';
import { getBooks, getBookById } from '../../api/books.api';

export const useBooksQuery = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ['books', params],
        queryFn: () => getBooks(params),
    });
};

export const useBookDetailsQuery = (id: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['book', id],
        queryFn: () => getBookById(id),
        enabled: options?.enabled,
    });
};
