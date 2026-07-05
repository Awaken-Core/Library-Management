import { api } from '../lib/api';

export const requestBorrow = async (bookId: string) => {
    const { data } = await api.post('/borrows', { bookId });
    return data;
};

export const getMyBorrows = async () => {
    const { data } = await api.get('/borrows/my');
    return data;
};

export const cancelBorrowRequest = async (id: string) => {
    const { data } = await api.delete(`/borrows/${id}`);
    return data;
};
