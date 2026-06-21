"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    RotateCcw, 
    Calendar, 
    User, 
    BookOpen, 
    AlertCircle, 
    Loader2, 
    X,
    Search,
    BookMarked,
    CalendarClock
} from "lucide-react";
import { api } from "../../../lib/api";

interface BookDetail {
    id: string;
    title: string;
    author: string;
    isbn: string;
}

interface BookCopy {
    id: string;
    barcode: string;
    status: string;
    book: BookDetail;
}

interface BorrowBook {
    id: string;
    borrowId: string;
    bookId: string;
    book: BookCopy;
}

interface UserDetail {
    id: string;
    name: string;
    email: string;
}

interface BorrowRecord {
    id: string;
    userId: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
    createdAt: string;
    returnDate: string | null;
    grantDate: string | null;
    returnedOn: string | null;
    user: UserDetail;
    borrowBooks: BorrowBook[];
    penalties?: {
        id: string;
        amount: number;
        paid: boolean;
    }[];
}

export default function RequestsPage() {
    const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "RETURNED">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state for approving
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedBorrowId, setSelectedBorrowId] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchBorrows = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            // Get all borrows, we filter client-side for reliable stat counters and smoother filtering
            const res = await api.get("/admin/borrows");
            if (res.data.success) {
                setBorrows(res.data.data || []);
            } else {
                setError(res.data.message || "Failed to load requests");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to load requests");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBorrows();
    }, [fetchBorrows]);

    // Calculate stats
    const stats = {
        pending: borrows.filter(b => b.status === "PENDING").length,
        approved: borrows.filter(b => b.status === "APPROVED").length,
        rejected: borrows.filter(b => b.status === "REJECTED").length,
        returned: borrows.filter(b => b.status === "RETURNED").length,
        total: borrows.length
    };

    // Filter and search
    const filteredBorrows = borrows.filter(b => {
        const matchesStatus = filter === "ALL" || b.status === filter;
        const studentName = b.user?.name?.toLowerCase() || "";
        const studentEmail = b.user?.email?.toLowerCase() || "";
        const bookTitles = b.borrowBooks.map(bb => bb.book?.book?.title?.toLowerCase() || "").join(" ");
        const query = searchQuery.toLowerCase();
        const matchesSearch = studentName.includes(query) || studentEmail.includes(query) || bookTitles.includes(query);
        return matchesStatus && matchesSearch;
    });

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to REJECT this borrow request?")) return;
        setSubmitting(true);
        try {
            await api.patch(`/admin/borrows/${id}/reject`);
            alert("Borrow request rejected.");
            fetchBorrows();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to reject request");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = async (id: string) => {
        if (!confirm("Confirm that all books in this request have been returned?")) return;
        setSubmitting(true);
        try {
            const res = await api.post(`/admin/borrows/${id}/return`);
            alert(res.data.message || "Books marked as returned.");
            fetchBorrows();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to process return");
        } finally {
            setSubmitting(false);
        }
    };

    const openApproveModal = (id: string) => {
        setSelectedBorrowId(id);
        // Default due date to 14 days from now
        const defaultDue = new Date();
        defaultDue.setDate(defaultDue.getDate() + 14);
        setDueDate(defaultDue.toISOString().split("T")[0]);
        setIsApproveModalOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedBorrowId || !dueDate) return;
        setSubmitting(true);
        try {
            await api.patch(`/admin/borrows/${selectedBorrowId}/approve`, {
                returnDate: new Date(dueDate).toISOString()
            });
            setIsApproveModalOpen(false);
            setSelectedBorrowId(null);
            alert("Borrow request approved!");
            fetchBorrows();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to approve request");
        } finally {
            setSubmitting(false);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
            case "APPROVED":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50";
            case "REJECTED":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50";
            case "RETURNED":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50";
            default:
                return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200";
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white flex items-center gap-3">
                        <BookMarked className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        Borrow Requests
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage approvals, returns, and track student borrowing cycles.
                    </p>
                </div>
                
                {/* Search bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search student or book..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-blue-500/10 focus:border-blue-500 transition-all text-zinc-900 dark:text-white"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 rounded-full"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <button 
                    onClick={() => setFilter("ALL")}
                    className={`p-5 rounded-2xl border text-left transition-all ${filter === "ALL" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md" : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                >
                    <p className={`text-xs font-semibold ${filter === "ALL" ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500"}`}>Total Requests</p>
                    <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </button>

                <button 
                    onClick={() => setFilter("PENDING")}
                    className={`p-5 rounded-2xl border text-left transition-all ${filter === "PENDING" ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20" : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                >
                    <p className={`text-xs font-semibold ${filter === "PENDING" ? "text-amber-100" : "text-zinc-500"}`}>Pending Approval</p>
                    <p className="text-2xl font-bold mt-1">{stats.pending}</p>
                </button>

                <button 
                    onClick={() => setFilter("APPROVED")}
                    className={`p-5 rounded-2xl border text-left transition-all ${filter === "APPROVED" ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20" : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                >
                    <p className={`text-xs font-semibold ${filter === "APPROVED" ? "text-green-100" : "text-zinc-500"}`}>Active Borrows</p>
                    <p className="text-2xl font-bold mt-1">{stats.approved}</p>
                </button>

                <button 
                    onClick={() => setFilter("RETURNED")}
                    className={`p-5 rounded-2xl border text-left transition-all ${filter === "RETURNED" ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20" : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                >
                    <p className={`text-xs font-semibold ${filter === "RETURNED" ? "text-blue-100" : "text-zinc-500"}`}>Returned</p>
                    <p className="text-2xl font-bold mt-1">{stats.returned}</p>
                </button>

                <button 
                    onClick={() => setFilter("REJECTED")}
                    className={`p-5 rounded-2xl border text-left transition-all ${filter === "REJECTED" ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20" : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                >
                    <p className={`text-xs font-semibold ${filter === "REJECTED" ? "text-red-100" : "text-zinc-500"}`}>Rejected</p>
                    <p className="text-2xl font-bold mt-1">{stats.rejected}</p>
                </button>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-spin" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">Loading borrow requests...</p>
                </div>
            ) : error ? (
                <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl text-red-600 dark:text-red-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">Error loading requests</h3>
                    <p className="text-sm mt-1">{error}</p>
                    <button onClick={fetchBorrows} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
                        Try Again
                    </button>
                </div>
            ) : filteredBorrows.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4 text-zinc-400">
                        <BookMarked className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No matching requests</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-sm">
                        There are no borrow requests matching the current status filter and search query.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Requested Book(s)</th>
                                    <th className="px-6 py-4">Request Date</th>
                                    <th className="px-6 py-4">Status & Schedule</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredBorrows.map((record) => {
                                    const studentName = record.user?.name || "Unknown Member";
                                    const studentEmail = record.user?.email || "-";
                                    
                                    // Check if request is overdue
                                    const isOverdue = record.status === "APPROVED" && record.returnDate && new Date() > new Date(record.returnDate);

                                    return (
                                        <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                            {/* User Details */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                                        {studentName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 dark:text-white text-sm">{studentName}</p>
                                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">{studentEmail}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Books Requested */}
                                            <td className="px-6 py-5 max-w-sm">
                                                <div className="space-y-1">
                                                    {record.borrowBooks.map((bb, index) => {
                                                        const bookTitle = bb.book?.book?.title || "Unknown Book";
                                                        const bookBarcode = bb.book?.barcode || "No Barcode";
                                                        return (
                                                            <div key={index} className="flex flex-col">
                                                                <span className="font-medium text-zinc-900 dark:text-white text-sm line-clamp-1">{bookTitle}</span>
                                                                <span className="text-zinc-400 dark:text-zinc-500 text-xs">Copy Barcode: {bookBarcode}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>

                                            {/* Request Date */}
                                            <td className="px-6 py-5 text-sm text-zinc-600 dark:text-zinc-300">
                                                {formatDate(record.createdAt)}
                                            </td>

                                            {/* Status Badge & Dates */}
                                            <td className="px-6 py-5 text-sm">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                                                        {record.status}
                                                    </span>

                                                    {/* Overdue alert */}
                                                    {isOverdue && (
                                                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-xs animate-pulse">
                                                            <CalendarClock className="w-3.5 h-3.5" /> OVERDUE
                                                        </span>
                                                    )}

                                                    {/* Custom dates depending on status */}
                                                    {record.status === "APPROVED" && record.returnDate && (
                                                        <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                                                            Due: {formatDate(record.returnDate)}
                                                        </span>
                                                    )}

                                                    {record.status === "RETURNED" && record.returnedOn && (
                                                        <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                                                            Returned: {formatDate(record.returnedOn)}
                                                        </span>
                                                    )}

                                                    {record.status === "REJECTED" && (
                                                        <span className="text-zinc-400 dark:text-zinc-500 text-xs">
                                                            Request was rejected
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-5 text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    {record.status === "PENDING" && (
                                                        <>
                                                            <button
                                                                onClick={() => openApproveModal(record.id)}
                                                                disabled={submitting}
                                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(record.id)}
                                                                disabled={submitting}
                                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {record.status === "APPROVED" && (
                                                        <button
                                                            onClick={() => handleReturn(record.id)}
                                                            disabled={submitting}
                                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" /> Mark Returned
                                                        </button>
                                                    )}

                                                    {["RETURNED", "REJECTED"].includes(record.status) && (
                                                        <span className="text-zinc-400 dark:text-zinc-500 text-xs italic">
                                                            No actions available
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {isApproveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm transition-opacity">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 relative">
                        <button 
                            onClick={() => setIsApproveModalOpen(false)}
                            className="absolute right-4 top-4 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                                Set Return Due Date
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                                Choose the deadline for returning the borrowed book copies.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-3 mt-6">
                                <button
                                    onClick={() => setIsApproveModalOpen(false)}
                                    className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={submitting || !dueDate}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                >
                                    {submitting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Approving...</>
                                    ) : (
                                        "Approve Request"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
