"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
    BookOpen, 
    Clock, 
    Calendar, 
    AlertCircle, 
    Loader2, 
    XCircle,
    CalendarCheck,
    Bookmark,
    ArrowUpRight,
    HelpCircle,
    DollarSign
} from "lucide-react";
import Link from "next/link";
import AlertModal from "../components/AlertModal";
import { useMyBorrowsQuery, useCancelBorrowMutation } from "../../hooks/queries/useBorrows";

interface BookDetail {
    id: string;
    title: string;
    author: string;
    isbn: string;
}

interface BookCopy {
    id: string;
    barcode: string;
    book: BookDetail;
}

interface BorrowBook {
    id: string;
    book: BookCopy;
}

interface BorrowRecord {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
    createdAt: string;
    borrowDate: string;
    grantDate: string | null;
    returnDate: string | null;
    returnedOn: string | null;
    borrowBooks: BorrowBook[];
    penalty?: {
        id: string;
        amount: number;
        paid: boolean;
    } | null;
}

export default function MyBooksPage() {
    const { data: queryData, isLoading: loading, error: queryError } = useMyBorrowsQuery();
    const borrows = queryData?.data || [];
    
    const { mutateAsync: cancelBorrow, isPending: actionLoading } = useCancelBorrowMutation();
    
    const [error, setError] = useState("");
    
    useEffect(() => {
        if (queryError) {
            setError((queryError as any).response?.data?.message || (queryError as any).message || "Failed to load borrowings");
        } else {
            setError("");
        }
    }, [queryError]);

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    // Handled by React Query hooks

    const handleCancelRequest = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this pending borrow request?")) return;
        try {
            await cancelBorrow(id);
            showAlert("Success", "Borrow request cancelled.", "success");
        } catch (err: any) {
            showAlert("Error", err.response?.data?.message || "Failed to cancel request", "error");
        }
    };

    const pendingRequests = borrows.filter((b: BorrowRecord) => b.status === "PENDING");
    const activeBorrows = borrows.filter((b: BorrowRecord) => b.status === "APPROVED");

    const stats = {
        active: activeBorrows.reduce((sum: number, b: BorrowRecord) => sum + (b.borrowBooks?.length || 0), 0),
        pending: pendingRequests.length,
        overdue: activeBorrows.filter((b: BorrowRecord) => {
            if (!b.returnDate) return false;
            return new Date() > new Date(b.returnDate);
        }).length
    };

    const getDaysRemaining = (dueDateStr: string | null) => {
        if (!dueDateStr) return 0;
        const due = new Date(dueDateStr);
        const today = new Date();
        due.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateEstimatedPenalty = (dueDateStr: string | null) => {
        if (!dueDateStr) return 0;
        const days = -getDaysRemaining(dueDateStr);
        if (days <= 0) return 0;
        return days * 50; 
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const allDisplayRecords = [...pendingRequests, ...activeBorrows];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        My Active Books
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Track your current borrow requests, active books, and due dates.
                    </p>
                </div>
                <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/10">
                    Browse Books <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-2xl">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Books Borrowed</p>
                        <p className="text-3xl font-black text-zinc-950 dark:text-white mt-1">{stats.active}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-2xl">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Awaiting Approval</p>
                        <p className="text-3xl font-black text-zinc-950 dark:text-white mt-1">{stats.pending}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className={`p-3.5 rounded-2xl ${stats.overdue > 0 ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" : "bg-zinc-50 text-zinc-400"}`}>
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overdue Books</p>
                        <p className={`text-3xl font-black mt-1 ${stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-zinc-950 dark:text-white"}`}>{stats.overdue}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">Loading your active borrowings...</p>
                </div>
            ) : error ? (
                <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl text-red-600 dark:text-red-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">Error loading borrowings</h3>
                    <p className="text-sm mt-1">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
                        Try Again
                    </button>
                </div>
            ) : allDisplayRecords.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4 text-zinc-400">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No active books</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-sm">
                        You do not have any active borrows or pending requests right now. Go check out the collection to request books.
                    </p>
                    <Link href="/" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/10">
                        Explore Book Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allDisplayRecords.map((record: BorrowRecord) => {
                        const isPending = record.status === "PENDING";
                        const isApproved = record.status === "APPROVED";
                        const daysLeft = isApproved ? getDaysRemaining(record.returnDate) : 0;
                        const isOverdue = isApproved && daysLeft < 0;
                        const estPenalty = isOverdue ? calculateEstimatedPenalty(record.returnDate) : 0;

                        return (
                            <div 
                                key={record.id}
                                className={`bg-white dark:bg-zinc-900 rounded-3xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all hover:shadow-md ${isOverdue ? "border-red-200 dark:border-red-950" : "border-zinc-200 dark:border-zinc-800"}`}
                            >
                                {isOverdue && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[40px] rounded-full pointer-events-none"></div>
                                )}
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${isPending ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                                            {isPending ? "Awaiting Admin Approval" : "Borrowed (Active)"}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">ID: {record.id.substring(0, 8)}</span>
                                    </div>

                                    <div className="space-y-3">
                                        {(record.borrowBooks || (record as any).bookBorrows || []).map((bb: BorrowBook, idx: number) => {
                                            const bookTitle = bb.book?.book?.title || "Unknown Book";
                                            const bookAuthor = bb.book?.book?.author || "Unknown Author";
                                            const bookBarcode = bb.book?.barcode || "-";
                                            return (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="w-10 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 text-zinc-400">
                                                        <Bookmark className="w-5 h-5 text-blue-500/60" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">{bookTitle}</h4>
                                                        <p className="text-xs text-zinc-500">{bookAuthor}</p>
                                                        <p className="text-[10px] text-zinc-400 mt-0.5">Copy: {bookBarcode}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Actions / Details footer */}
                                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        {isPending && (
                                            <>
                                                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Request Date</span>
                                                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{formatDate(record.createdAt)}</span>
                                            </>
                                        )}
                                        {isApproved && record.returnDate && (
                                            <>
                                                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Due Deadline</span>
                                                <span className={`text-xs font-bold flex items-center gap-1 ${isOverdue ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                                                    <CalendarCheck className="w-3.5 h-3.5" /> {formatDate(record.returnDate)}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    {isPending ? (
                                        <button
                                            onClick={() => handleCancelRequest(record.id)}
                                            disabled={actionLoading}
                                            className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Cancel Request
                                        </button>
                                    ) : (
                                        isApproved && (
                                            <div className="text-right">
                                                {isOverdue ? (
                                                    <div className="space-y-0.5">
                                                        <span className="block text-[10px] font-bold text-red-600 uppercase tracking-wider">Overdue fine estimate</span>
                                                        <span className="text-sm font-black text-red-600">₹{estPenalty}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 px-2.5 py-1 rounded-lg">
                                                        {daysLeft} days remaining
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
}
