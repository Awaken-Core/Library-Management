"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    BookOpen, 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Plus, 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    Barcode, 
    Tag, 
    FileText, 
    Calendar,
    Globe,
    User,
    Bookmark,
    Save,
    X
} from "lucide-react";
import Link from "next/link";
import { useAddBookCopiesMutation, useAdminBookQuery, useDeleteBookMutation, useUpdateBookMutation, useUpdateCopyStatusMutation } from "../../../../hooks/queries/useAdminQueries";
import AlertModal from "../../components/AlertModal";

interface BookCopy {
    id: string;
    barcode: string;
    status: "AVAILABLE" | "BORROWED" | "LOST" | "DAMAGED";
    createdAt: string;
}

interface BookDetails {
    id: string;
    isbn: string;
    title: string;
    author: string;
    description: string | null;
    publisher: string | null;
    edition: string | null;
    language: string | null;
    publishedAt: string;
    createdAt: string;
    bookCopies: BookCopy[];
}

export default function BookDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const bookId = Array.isArray(id) ? id[0] : id;
    const { data: bookResponse, isLoading: loading, error: queryError } = useAdminBookQuery(bookId);
    const updateBookMutation = useUpdateBookMutation();
    const deleteBookMutation = useDeleteBookMutation();
    const addCopiesMutation = useAddBookCopiesMutation();
    const updateCopyStatusMutation = useUpdateCopyStatusMutation(bookId);
    const book = (bookResponse?.data ?? null) as BookDetails | null;
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Edit form states
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: "",
        author: "",
        isbn: "",
        publisher: "",
        edition: "",
        language: "",
        publishedAt: "",
        description: ""
    });

    // Add copies state
    const [newBarcodes, setNewBarcodes] = useState("");
    const actionLoading = updateBookMutation.isPending || deleteBookMutation.isPending || addCopiesMutation.isPending || updateCopyStatusMutation.isPending;

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
        onCloseCallback?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = (
        title: string,
        message: string,
        type: 'success' | 'error' | 'info' | 'warning' = 'info',
        onCloseCallback?: () => void
    ) => {
        setAlertConfig({ isOpen: true, title, message, type, onCloseCallback });
    };

    useEffect(() => {
        if (!book) return;
        setEditFormData({
            title: book.title || "",
            author: book.author || "",
            isbn: book.isbn || "",
            publisher: book.publisher || "",
            edition: book.edition || "",
            language: book.language || "",
            publishedAt: book.publishedAt ? book.publishedAt.split("T")[0] : "",
            description: book.description || ""
        });
    }, [book]);

    useEffect(() => {
        if (queryError) setError("Failed to load book details");
    }, [queryError]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setSuccessMessage("");
        setError("");
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateBook = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookId) return;
        setError("");
        setSuccessMessage("");
        const payload = {
            ...editFormData,
            publishedAt: new Date(editFormData.publishedAt).toISOString()
        };
        updateBookMutation.mutate({ id: bookId, payload }, {
            onSuccess: () => {
                setSuccessMessage("Book details updated successfully!");
                setIsEditing(false);
            },
            onError: () => setError("Failed to update book"),
        });
    };

    const handleDeleteBook = () => {
        if (!bookId) return;
        if (!confirm("Are you sure you want to delete this book entirely from the catalog? This will delete all copies and history.")) return;
        deleteBookMutation.mutate(bookId, {
            onSuccess: () => showAlert("Success", "Book deleted successfully.", "success", () => router.push("/inventory")),
            onError: () => showAlert("Error", "Failed to delete book", "error"),
        });
    };

    const handleAddCopies = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookId) return;
        setError("");
        setSuccessMessage("");

        const barcodesArray = newBarcodes
            .split(/[\n,]+/)
            .map(code => code.trim())
            .filter(code => code.length > 0);

        if (barcodesArray.length === 0) {
            setError("Please enter at least one barcode.");
            return;
        }

        addCopiesMutation.mutate({ id: bookId, barcodes: barcodesArray }, {
            onSuccess: (res) => {
                setSuccessMessage(res.message || "Copies added successfully!");
                setNewBarcodes("");
            },
            onError: () => setError("Failed to add copies"),
        });
    };

    const handleCopyStatusChange = (copyId: string, newStatus: string) => {
        setError("");
        setSuccessMessage("");
        updateCopyStatusMutation.mutate({ copyId, status: newStatus }, {
            onSuccess: () => setSuccessMessage("Copy status updated successfully!"),
            onError: () => setError("Failed to update copy status"),
        });
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "AVAILABLE":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50";
            case "BORROWED":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50";
            case "LOST":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50";
            case "DAMAGED":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
            default:
                return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-spin" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">Loading book details...</p>
            </div>
        );
    }

    if (error && !book) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 max-w-2xl mx-auto mt-12">
                <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Failed to load book</h3>
                <p className="text-sm mt-1">{error}</p>
                <Link href="/inventory" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors shadow-md">
                    <ArrowLeft className="w-4 h-4" /> Back to Inventory
                </Link>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-2xl mx-auto mt-12">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-zinc-400" />
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Book not found</h3>
                <Link href="/inventory" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md">
                    <ArrowLeft className="w-4 h-4" /> Back to Inventory
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
            {/* Header / Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <Link href="/inventory" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-semibold">
                    <ArrowLeft className="w-4 h-4" /> Back to Inventory
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleEditToggle}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${isEditing ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700" : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
                    >
                        {isEditing ? <><X className="w-4 h-4" /> Cancel Edit</> : <><Edit className="w-4 h-4" /> Edit Book</>}
                    </button>
                    <button
                        onClick={handleDeleteBook}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" /> Delete Book
                    </button>
                </div>
            </div>

            {/* Notification messages */}
            {successMessage && (
                <div className="p-4 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{successMessage}</p>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Book Metadata / Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

                        {isEditing ? (
                            /* EDIT MODE FORM */
                            <form onSubmit={handleUpdateBook} className="space-y-6">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Edit Book Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Book Title *</label>
                                        <input
                                            type="text" name="title" required value={editFormData.title} onChange={handleEditChange}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Author(s) *</label>
                                        <input
                                            type="text" name="author" required value={editFormData.author} onChange={handleEditChange}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">ISBN *</label>
                                        <input
                                            type="text" name="isbn" required value={editFormData.isbn} onChange={handleEditChange}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Publisher</label>
                                        <input
                                            type="text" name="publisher" value={editFormData.publisher} onChange={handleEditChange}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Publication Date *</label>
                                        <input
                                            type="date" name="publishedAt" required value={editFormData.publishedAt} onChange={handleEditChange}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Edition</label>
                                        <input
                                            type="text" name="edition" value={editFormData.edition} onChange={handleEditChange}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Language</label>
                                        <input
                                            type="text" name="language" value={editFormData.language} onChange={handleEditChange}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                                        <textarea
                                            name="description" value={editFormData.description} onChange={handleEditChange} rows={4}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        type="submit" disabled={actionLoading}
                                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                    <button
                                        type="button" onClick={handleEditToggle}
                                        className="px-6 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold text-sm hover:bg-zinc-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* VIEW MODE DETAILS */
                            <div className="space-y-6">
                                <div>
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest">Book Details</span>
                                    <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mt-1">{book.title}</h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">by {book.author}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-start gap-2.5">
                                        <Bookmark className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ISBN</p>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">{book.isbn}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <User className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Publisher</p>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">{book.publisher || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <Calendar className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Published</p>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">{formatDate(book.publishedAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <Globe className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Language</p>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">{book.language || "English"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description / Synopsis</h4>
                                    <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                                        {book.description || "No description provided for this book catalog entry."}
                                    </p>
                                </div>

                                {book.edition && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                                        <FileText className="w-3.5 h-3.5" /> Edition: {book.edition}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* PHYSICAL COPIES LIST */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Physical Book Copies</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Physical copies registered in inventory for borrowing</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold text-xs">
                                {book.bookCopies?.length || 0} Total Copies
                            </span>
                        </div>

                        {book.bookCopies?.length === 0 ? (
                            <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <Barcode className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                                <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">No Physical Copies</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
                                    Before students can borrow this book, you must register physical barcodes on the right panel.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
                                            <th className="px-6 py-4">Barcode</th>
                                            <th className="px-6 py-4">Added Date</th>
                                            <th className="px-6 py-4">Status / Update</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {book.bookCopies.map((copy) => (
                                            <tr key={copy.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                                    <Barcode className="w-4 h-4 text-zinc-400" />
                                                    {copy.barcode}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-500 text-xs">
                                                    {formatDate(copy.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(copy.status)}`}>
                                                            {copy.status}
                                                        </span>

                                                        <select
                                                            value={copy.status}
                                                            onChange={(e) => handleCopyStatusChange(copy.id, e.target.value)}
                                                            className="p-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        >
                                                            <option value="AVAILABLE">AVAILABLE</option>
                                                            <option value="BORROWED">BORROWED</option>
                                                            <option value="LOST">LOST</option>
                                                            <option value="DAMAGED">DAMAGED</option>
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right 1 Column: Add Copies Panel */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

                        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6 relative z-10">
                            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Add Inventory Copies</h3>
                        </div>

                        <form onSubmit={handleAddCopies} className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    Copy Barcodes *
                                </label>
                                <textarea
                                    required
                                    value={newBarcodes}
                                    onChange={(e) => setNewBarcodes(e.target.value)}
                                    placeholder="Enter copy barcodes (one barcode per line or separated by commas)"
                                    rows={8}
                                    className="w-full p-3.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm placeholder:text-zinc-400 font-mono resize-none"
                                />
                            </div>

                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>
                                    Ensure barcode labels match physical tags. Duplicate barcodes across the system will be rejected.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading || !newBarcodes.trim()}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                {actionLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                                ) : (
                                    <><Plus className="w-4 h-4" /> Add Physical Copies</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    if (alertConfig.onCloseCallback) alertConfig.onCloseCallback();
                }}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
}



