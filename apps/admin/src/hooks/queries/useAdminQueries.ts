import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addBookCopies,
    approveBorrow,
    createBook,
    createStudent,
    deleteBook,
    getAdminBook,
    getAdminBorrows,
    getAdminPenalties,
    getAdminUser,
    getAdminUsers,
    getDashboardStats,
    getPublicBooks,
    payPenalty,
    rejectBorrow,
    returnBorrow,
    toggleUserBan,
    updateBook,
    updateCopyStatus,
    type CreateBookPayload,
    type CreateStudentPayload,
} from "../../api/admin.api";

export const adminQueryKeys = {
    stats: ["admin", "stats"] as const,
    books: (search?: string) => ["admin", "books", search ?? ""] as const,
    book: (id?: string) => ["admin", "book", id ?? ""] as const,
    users: ["admin", "users"] as const,
    user: (id?: string) => ["admin", "user", id ?? ""] as const,
    borrows: ["admin", "borrows"] as const,
    penalties: ["admin", "penalties"] as const,
};

export const useDashboardStatsQuery = () => useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: getDashboardStats,
});

export const useAdminBooksQuery = (search?: string) => useQuery({
    queryKey: adminQueryKeys.books(search),
    queryFn: () => getPublicBooks(search),
});

export const useAdminBookQuery = (id?: string) => useQuery({
    queryKey: adminQueryKeys.book(id),
    queryFn: () => getAdminBook(id as string),
    enabled: Boolean(id),
});

export const useCreateBookMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateBookPayload) => createBook(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "books"] });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
        },
    });
};

export const useUpdateBookMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateBook,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.book(variables.id) });
            queryClient.invalidateQueries({ queryKey: ["admin", "books"] });
        },
    });
};

export const useDeleteBookMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBook,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "books"] });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
        },
    });
};

export const useAddBookCopiesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addBookCopies,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.book(variables.id) });
            queryClient.invalidateQueries({ queryKey: ["admin", "books"] });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
        },
    });
};

export const useUpdateCopyStatusMutation = (bookId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCopyStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.book(bookId) });
            queryClient.invalidateQueries({ queryKey: ["admin", "books"] });
        },
    });
};

export const useAdminUsersQuery = () => useQuery({
    queryKey: adminQueryKeys.users,
    queryFn: getAdminUsers,
});

export const useAdminUserQuery = (id?: string) => useQuery({
    queryKey: adminQueryKeys.user(id),
    queryFn: () => getAdminUser(id as string),
    enabled: Boolean(id),
});

export const useCreateStudentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateStudentPayload) => createStudent(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.users });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
        },
    });
};

export const useToggleUserBanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleUserBan,
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.users });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.user(id) });
        },
    });
};

export const useAdminBorrowsQuery = () => useQuery({
    queryKey: adminQueryKeys.borrows,
    queryFn: getAdminBorrows,
});

export const useApproveBorrowMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveBorrow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.borrows });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
        },
    });
};

export const useRejectBorrowMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rejectBorrow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.borrows });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
        },
    });
};

export const useReturnBorrowMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: returnBorrow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.borrows });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.penalties });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
        },
    });
};

export const useAdminPenaltiesQuery = () => useQuery({
    queryKey: adminQueryKeys.penalties,
    queryFn: getAdminPenalties,
});

export const usePayPenaltyMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: payPenalty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.penalties });
        },
    });
};
