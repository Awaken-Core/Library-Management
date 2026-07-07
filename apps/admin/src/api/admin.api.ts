import { api } from "../lib/api";

export type ApiEnvelope<T> = {
    success: boolean;
    message?: string;
    data: T;
};

export type AdminStats = {
    totalBooks: number;
    totalStudents: number;
    pendingBorrows: number;
    approvedBorrows: number;
    overdueCount: number;
};

export type Book = {
    id: string;
    isbn: string;
    title: string;
    author: string;
    description?: string | null;
    publisher: string | null;
    edition?: string | null;
    language?: string | null;
    publishedAt: string;
    availableCopies: number;
    createdAt: string;
};

export type BookCopy = {
    id: string;
    barcode: string;
    status: "AVAILABLE" | "BORROWED" | "LOST" | "DAMAGED";
    createdAt: string;
};

export type BookDetails = Omit<Book, "availableCopies"> & {
    description: string | null;
    publisher: string | null;
    edition: string | null;
    language: string | null;
    bookCopies: BookCopy[];
};

export type Student = {
    id: string;
    name: string;
    email: string;
    phoneNo: string;
    role: string;
    isBanned: boolean;
    createdAt: string;
};

export type StudentDetails = Student & {
    borrowsUser: Array<{
        id: string;
        status: string;
        borrowDate: string;
        returnDate: string | null;
        returnedOn: string | null;
        borrowBooks: Array<{
            book: {
                barcode: string;
                book: { title: string; author: string };
            };
        }>;
    }>;
    penalties: Array<{
        id: string;
        amount: string;
        reason: string;
        createdAt: string;
    }>;
};

export type BorrowRecord = {
    id: string;
    userId: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
    createdAt: string;
    returnDate: string | null;
    grantDate: string | null;
    returnedOn: string | null;
    user: { id: string; name: string; email: string };
    borrowBooks: Array<{
        id: string;
        borrowId: string;
        bookId: string;
        book: {
            id: string;
            barcode: string;
            status: string;
            book: { id: string; title: string; author: string; isbn: string };
        };
    }>;
    penalties?: Array<{ id: string; amount: number; paid: boolean }>;
};

export type PenaltyRecord = {
    id: string;
    userId: string;
    amount: string;
    reason: string;
    paid: boolean;
    borrowId: string;
    createdAt: string;
    user: { name: string; email: string };
    borrow: {
        id: string;
        returnDate: string | null;
        returnedOn: string | null;
        borrowBooks: Array<{
            book: { barcode: string; book: { title: string } };
        }>;
    };
};

export type CreateBookPayload = {
    isbn: string;
    title: string;
    author: string;
    description: string;
    publisher: string;
    edition: string;
    language: string;
    publishedAt: string;
};

export type CreateStudentPayload = {
    name: string;
    email: string;
    phoneNo: string;
};

const unwrap = <T>(response: { data: ApiEnvelope<T> }) => response.data;

export const getDashboardStats = async () => unwrap<AdminStats>(await api.get("/admin/stats"));
export const getPublicBooks = async (search?: string) => unwrap<Book[]>(await api.get("/books", { params: search ? { search } : undefined }));
export const getAdminBook = async (id: string) => unwrap<BookDetails>(await api.get(`/admin/books/${id}`));
export const createBook = async (payload: CreateBookPayload) => unwrap<BookDetails>(await api.post("/admin/books", payload));
export const updateBook = async ({ id, payload }: { id: string; payload: CreateBookPayload }) => unwrap<BookDetails>(await api.put(`/admin/books/${id}`, payload));
export const deleteBook = async (id: string) => unwrap<null>(await api.delete(`/admin/books/${id}`));
export const addBookCopies = async ({ id, barcodes }: { id: string; barcodes: string[] }) => unwrap<BookDetails>(await api.post(`/admin/books/${id}/copies`, { barcodes }));
export const updateCopyStatus = async ({ copyId, status }: { copyId: string; status: string }) => unwrap<BookCopy>(await api.patch(`/admin/books/copies/${copyId}/status`, { status }));

export const getAdminUsers = async () => unwrap<Student[]>(await api.get("/admin/users"));
export const getAdminUser = async (id: string) => unwrap<StudentDetails>(await api.get(`/admin/users/${id}`));
export const createStudent = async (payload: CreateStudentPayload) => unwrap<Student>(await api.post("/students", payload));
export const toggleUserBan = async (id: string) => unwrap<Student>(await api.patch(`/admin/users/${id}/ban`));

export const getAdminBorrows = async () => unwrap<BorrowRecord[]>(await api.get("/admin/borrows"));
export const approveBorrow = async ({ id, returnDate }: { id: string; returnDate: string }) => unwrap<BorrowRecord>(await api.patch(`/admin/borrows/${id}/approve`, { returnDate }));
export const rejectBorrow = async (id: string) => unwrap<BorrowRecord>(await api.patch(`/admin/borrows/${id}/reject`));
export const returnBorrow = async (id: string) => unwrap<{ message?: string }>(await api.post(`/admin/borrows/${id}/return`));

export const getAdminPenalties = async () => unwrap<PenaltyRecord[]>(await api.get("/admin/penalties"));
export const payPenalty = async (id: string) => unwrap<PenaltyRecord>(await api.patch(`/admin/penalties/${id}/pay`));
