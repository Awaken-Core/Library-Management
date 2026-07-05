import { api } from '../lib/api';

export const getBooks = async (params?: Record<string, any>) => {
    const { data } = await api.get('/books', { params });
    return data;
};

export const getBookById = async (id: string) => {
    const { data } = await api.get(`/books/${id}`);
    return data;
};
