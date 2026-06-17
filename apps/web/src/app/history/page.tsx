"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
    History, 
    Calendar, 
    AlertCircle, 
    Loader2, 
    Bookmark, 
    CheckCircle2,
    XCircle,
    RotateCcw,
    Search,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import { api } from "../../lib/api";

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

export default function HistoryPage() {
    const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchMyBorrows = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/borrows/my");
            if (res.data.success) {
                setBorrows(res.data.data || []);
            } else {
                setError(res.data.message || "Failed to load history");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to load history");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyBorrows();
    }, [fetchMyBorrows]);

    // Filter to history (RETURNED & REJECTED)
    const historyRecords = borrows.filter(b => b.status === "RETURNED" || b.status === "REJECTED");

    // Filter by search query
    const filteredHistory = historyRecords.filter(b => {
        const bookTitles = b.borrowBooks.map(bb => bb.book?.book?.title?.toLowerCase() || "").join(" ");
        const bookAuthors = b.borrowBooks.map(bb => bb.book?.book?.author?.toLowerCase() || "").join(" ");
        const barcode = b.borrowBooks.map(bb => bb.book?.barcode?.toLowerCase() || "").join(" ");
        const query = searchQuery.toLowerCase();
        return bookTitles.includes(query) || bookAuthors.includes(query) || barcode.includes(query);
    });

    // Calculate history stats
    const stats = {
        returned: historyRecords.filter(b => b.status === "RETURNED").reduce((sum, b) => sum + b.borrowBooks.length, 0),
        rejected: historyRecords.filter(b => b.status === "REJECTED").length,
        totalFines: historyRecords.reduce((sum, b) => sum + (b.penalty ? Number(b.penalty.amount) : 0), 0)
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white flex items-center gap-3">
                        <History className="w-8 h-8 text-blue-600" />
                        Borrowing History
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        View records of your returned books, rejected requests, and paid/pending penalties.
                    </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search books in history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-blue-500/10 focus:border-blue-500 transition-all text-zinc-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 rounded-2xl">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Books Returned</p>
                        <p className="text-3xl font-black text-zinc-950 dark:text-white mt-1">{stats.returned}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-2xl">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rejected Requests</p>
                        <p className="text-3xl font-black text-zinc-950 dark:text-white mt-1">{stats.rejected}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 rounded-2xl">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Penalties</p>
                        <p className="text-3xl font-black text-zinc-950 dark:text-white mt-1">₹{stats.totalFines}</p>
                    </div>
                </div>
            </div>

            {/* Content list */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">Loading borrowing history...</p>
                </div>
            ) : error ? (
                <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl text-red-600 dark:text-red-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">Error loading history</h3>
                    <p className="text-sm mt-1">{error}</p>
                    <button onClick={fetchMyBorrows} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
                        Try Again
                    </button>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4 text-zinc-400">
                        <History className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No history records</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-sm">
                        You do not have any returned books or rejected requests matching your search.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Book Details</th>
                                    <th className="px-6 py-4">Borrow Date</th>
                                    <th className="px-6 py-4">End Date</th>
                                    <th className="px-6 py-4 text-right">Penalties (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredHistory.map((record) => {
                                    const isReturned = record.status === "RETURNED";
                                    const isRejected = record.status === "REJECTED";

                                    return (
                                        <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                            {/* Status Badge */}
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${isReturned ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                                        {record.status}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 font-mono">ID: {record.id.substring(0, 8)}</span>
                                                </div>
                                            </td>

                                            {/* Book information */}
                                            <td className="px-6 py-5 max-w-xs md:max-w-sm">
                                                <div className="space-y-2">
                                                    {record.borrowBooks.map((bb, idx) => {
                                                        const bookTitle = bb.book?.book?.title || "Unknown Book";
                                                        const bookAuthor = bb.book?.book?.author || "Unknown Author";
                                                        const bookBarcode = bb.book?.barcode || "-";
                                                        return (
                                                            <div key={idx} className="flex gap-2">
                                                                <Bookmark className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="font-semibold text-zinc-900 dark:text-white text-sm line-clamp-1">{bookTitle}</p>
                                                                    <p className="text-zinc-500 text-xs">{bookAuthor} (Copy: {bookBarcode})</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>

                                            {/* Borrow Date */}
                                            <td className="px-6 py-5 text-sm text-zinc-600 dark:text-zinc-300">
                                                {formatDate(record.borrowDate)}
                                            </td>

                                            {/* Returned Date or Rejected Date */}
                                            <td className="px-6 py-5 text-sm text-zinc-600 dark:text-zinc-300">
                                                {isReturned && (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span>Returned: <strong>{formatDate(record.returnedOn)}</strong></span>
                                                        {record.returnDate && (
                                                            <span className="text-[10px] text-zinc-400">Deadline: {formatDate(record.returnDate)}</span>
                                                        )}
                                                    </div>
                                                )}
                                                {isRejected && (
                                                    <span>Rejected: <strong>{formatDate(record.createdAt)}</strong></span>
                                                )}
                                            </td>

                                            {/* Penalty amount */}
                                            <td className="px-6 py-5 text-right font-bold text-sm">
                                                {record.penalty ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={record.penalty.paid ? "text-zinc-900 dark:text-white" : "text-amber-600 dark:text-amber-400"}>
                                                            ₹{Number(record.penalty.amount)}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${record.penalty.paid ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                                                            {record.penalty.paid ? "Paid" : "Pending"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-400 dark:text-zinc-600">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
