"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    BookOpen, 
    ArrowLeft, 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    Calendar,
    Globe,
    User,
    Bookmark,
    FileText,
    Sparkles,
    Check
} from "lucide-react";
import Link from "next/link";
import { useBookDetailsQuery } from "../../../hooks/queries/useBooks";
import { useBorrowBookMutation } from "../../../hooks/queries/useBorrows";

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
    availableCopies: number;
}

export default function StudentBookDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const idParam = Array.isArray(id) ? id[0] : (id as string);

    const { data: queryData, isLoading: loading, error: queryError } = useBookDetailsQuery(idParam || "", { enabled: !!idParam });
    const bookData = queryData?.data;
    const error = queryError ? ((queryError as any).response?.data?.message || (queryError as any).message || "Failed to load book details") : "";

    const [book, setBook] = useState<BookDetails | null>(null);
    
    useEffect(() => {
        if (bookData) {
            setBook(bookData);
        }
    }, [bookData]);

    const { mutateAsync: requestBorrow, isPending: borrowing } = useBorrowBookMutation();
    const [borrowError, setBorrowError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleBorrowRequest = async () => {
        if (!book || book.availableCopies <= 0) return;
        
        setBorrowError("");
        setSuccessMessage("");
        
        try {
            await requestBorrow(book.id);
            setSuccessMessage("Borrow request submitted successfully! Awaiting administrator approval.");
            setBook(prev => prev ? { ...prev, availableCopies: prev.availableCopies - 1 } : null);
        } catch (err: any) {
            setBorrowError(err.response?.data?.message || err.message || "Failed to submit borrow request");
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">Loading book details...</p>
            </div>
        );
    }

    if (error && !book) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl text-red-600 dark:text-red-400 max-w-2xl mx-auto mt-12">
                <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Failed to load book</h3>
                <p className="text-sm mt-1">{error}</p>
                <Link href="/" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors shadow-md">
                    <ArrowLeft className="w-4 h-4" /> Back to Catalog
                </Link>
            </div>
        );
    }

    if (!book) return null;

    const isAvailable = book.availableCopies > 0;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-16">
            {/* Header Navigation */}
            <div>
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-semibold">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>

            {/* Notification messages */}
            {successMessage && (
                <div className="p-4 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold">Request Submitted</p>
                        <p className="text-xs opacity-90 mt-0.5">{successMessage}</p>
                        <Link href="/my-books" className="text-xs font-bold underline mt-1.5 block hover:opacity-80">
                            View Request Status
                        </Link>
                    </div>
                </div>
            )}
            {borrowError && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{borrowError}</p>
                </div>
            )}

            {/* Book Details Container */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3">
                {/* Visual Cover Column */}
                <div className="p-8 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center border-r border-zinc-100 dark:border-zinc-800 min-h-[300px]">
                    <div className="w-36 h-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl flex items-center justify-center border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
                        <BookOpen className="w-16 h-16 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-2 text-center">
                            <span className="text-[10px] text-white font-mono uppercase tracking-wider">{book.isbn.substring(0, 6)}</span>
                        </div>
                    </div>
                    
                    {/* Stock Status Badge */}
                    <div className="mt-6 flex flex-col items-center gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isAvailable ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                            {isAvailable ? `${book.availableCopies} Copies Available` : "Out of Stock"}
                        </span>
                        {isAvailable && (
                            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" /> Ready to borrow
                            </p>
                        )}
                    </div>
                </div>

                {/* Details Column */}
                <div className="p-8 md:col-span-2 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="space-y-6 relative z-10">
                        <div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest">Book Catalog</span>
                            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1 tracking-tight">{book.title}</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">by {book.author}</p>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description / Synopsis</h4>
                            <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                                {book.description || "No synopsis is currently available for this book catalog entry."}
                            </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Bookmark className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                <span className="text-xs text-zinc-500">ISBN: <strong className="text-zinc-900 dark:text-white font-medium">{book.isbn}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                <span className="text-xs text-zinc-500">Publisher: <strong className="text-zinc-900 dark:text-white font-medium">{book.publisher || "-"}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                <span className="text-xs text-zinc-500">Published: <strong className="text-zinc-900 dark:text-white font-medium">{formatDate(book.publishedAt)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                <span className="text-xs text-zinc-500">Language: <strong className="text-zinc-900 dark:text-white font-medium">{book.language || "English"}</strong></span>
                            </div>
                        </div>

                        {book.edition && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                                <FileText className="w-3.5 h-3.5" /> Edition: {book.edition}
                            </div>
                        )}
                    </div>

                    {/* Borrow action footer */}
                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4 relative z-10">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Loan Period</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mt-0.5">14 days (Extendable upon request)</p>
                        </div>

                        <button
                            onClick={handleBorrowRequest}
                            disabled={borrowing || !isAvailable}
                            className={`px-6 py-3.5 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${isAvailable ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed shadow-none"}`}
                        >
                            {borrowing ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...</>
                            ) : isAvailable ? (
                                <><BookOpen className="w-4 h-4" /> Request Borrow</>
                            ) : (
                                "Out of Stock"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
