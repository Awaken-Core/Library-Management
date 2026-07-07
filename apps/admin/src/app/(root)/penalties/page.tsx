"use client";

import React, { useState } from "react";
import { 
    CircleDollarSign, 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    XCircle, 
    Search,
    User,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    ShieldAlert
} from "lucide-react";
import { useAdminPenaltiesQuery, usePayPenaltyMutation } from "../../../hooks/queries/useAdminQueries";
import AlertModal from "../components/AlertModal";

interface BookDetail {
    title: string;
}
interface BookCopy {
    barcode: string;
    book: BookDetail;
}
interface BorrowBook {
    book: BookCopy;
}
interface UserDetail {
    name: string;
    email: string;
}
interface BorrowRecord {
    id: string;
    returnDate: string | null;
    returnedOn: string | null;
    borrowBooks: BorrowBook[];
}
interface PenaltyRecord {
    id: string;
    userId: string;
    amount: string; // prisma Decimal returned as string
    reason: string;
    paid: boolean;
    borrowId: string;
    createdAt: string;
    user: UserDetail;
    borrow: BorrowRecord;
}

export default function PenaltiesPage() {
    const { data: penaltiesResponse, isLoading: loading, error: queryError, refetch: refetchPenalties } = useAdminPenaltiesQuery();
    const payPenaltyMutation = usePayPenaltyMutation();
    const penalties = (penaltiesResponse?.data ?? []) as PenaltyRecord[];
    const error = queryError ? "Failed to load penalty records" : "";
    const [filter, setFilter] = useState<"ALL" | "PAID" | "UNPAID">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const submitting = payPenaltyMutation.isPending;

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

    const handleMarkPaid = (id: string, amount: string, studentName: string) => {
        if (!confirm(`Confirm payment of Rs. ${amount} received from ${studentName}?`)) return;
        payPenaltyMutation.mutate(id, {
            onSuccess: () => showAlert("Success", "Penalty marked as settled.", "success"),
            onError: () => showAlert("Error", "Failed to mark penalty as paid", "error"),
        });
    };

    // Calculate metrics
    const stats = {
        totalCount: penalties.length,
        unpaidCount: penalties.filter(p => !p.paid).length,
        unpaidAmount: penalties.filter(p => !p.paid).reduce((sum, p) => sum + Number(p.amount), 0),
        paidAmount: penalties.filter(p => p.paid).reduce((sum, p) => sum + Number(p.amount), 0)
    };

    // Filter and search
    const filteredPenalties = penalties.filter(p => {
        const matchesFilter = filter === "ALL" || (filter === "PAID" ? p.paid : !p.paid);
        const studentName = p.user?.name?.toLowerCase() || "";
        const studentEmail = p.user?.email?.toLowerCase() || "";
        const reason = p.reason?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        
        return matchesFilter && (studentName.includes(query) || studentEmail.includes(query) || reason.includes(query));
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white flex items-center gap-3">
                        <CircleDollarSign className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        Penalty Fines
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Track, review, and settle late book return fines in Indian Rupees (Rs. ).
                    </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search student or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all text-zinc-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-lg">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Unpaid Fine Sum</p>
                        <p className="text-2xl font-black text-red-600 mt-1">Rs. {stats.unpaidAmount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 rounded-lg">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Settled Fine Sum</p>
                        <p className="text-2xl font-black text-green-600 mt-1">Rs. {stats.paidAmount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pending Penalties</p>
                        <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">{stats.unpaidCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-lg">
                        <CircleDollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Penalties Logged</p>
                        <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">{stats.totalCount}</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px">
                <button
                    onClick={() => setFilter("ALL")}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all ${filter === "ALL" ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
                >
                    All Fines
                </button>
                <button
                    onClick={() => setFilter("UNPAID")}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all ${filter === "UNPAID" ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
                >
                    Unpaid ({stats.unpaidCount})
                </button>
                <button
                    onClick={() => setFilter("PAID")}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all ${filter === "PAID" ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
                >
                    Paid
                </button>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">Loading penalty logs...</p>
                </div>
            ) : error ? (
                <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">Error loading penalties</h3>
                    <p className="text-sm mt-1">{error}</p>
                    <button onClick={() => refetchPenalties()} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
                        Try Again
                    </button>
                </div>
            ) : filteredPenalties.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4 text-zinc-400">
                        <CircleDollarSign className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No penalties found</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-sm">
                        There are no penalty logs matching the selected filter or search keyword.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Reason Details</th>
                                    <th className="px-6 py-4">Date Applied</th>
                                    <th className="px-6 py-4">Status & Fine</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredPenalties.map((p) => {
                                    const studentName = p.user?.name || "Unknown Member";
                                    const studentEmail = p.user?.email || "-";
                                    const bookNames = p.borrow?.borrowBooks?.map(bb => bb.book?.book?.title).join(", ") || "Unknown Books";

                                    return (
                                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                            {/* User Details */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm">
                                                        {studentName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 dark:text-white text-sm">{studentName}</p>
                                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">{studentEmail}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Reason / Borrow Detail */}
                                            <td className="px-6 py-5 max-w-xs md:max-w-md">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-zinc-900 dark:text-white text-sm">{p.reason}</span>
                                                    <span className="text-zinc-400 dark:text-zinc-500 text-xs line-clamp-1">Books: {bookNames}</span>
                                                    <span className="text-[10px] text-zinc-400 font-mono">Borrow ID: {p.borrowId.substring(0, 8)}</span>
                                                </div>
                                            </td>

                                            {/* Date Applied */}
                                            <td className="px-6 py-5 text-sm text-zinc-600 dark:text-zinc-300">
                                                {formatDate(p.createdAt)}
                                            </td>

                                            {/* Amount & Status */}
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="text-sm font-black text-zinc-900 dark:text-white">Rs. {p.amount}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.paid ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                                                        {p.paid ? "Settled" : "Unpaid"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-5 text-right text-sm font-medium">
                                                {!p.paid ? (
                                                    <button
                                                        onClick={() => handleMarkPaid(p.id, p.amount, studentName)}
                                                        disabled={submitting}
                                                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-1 shadow-sm"
                                                    >
                                                        Mark as Settled
                                                    </button>
                                                ) : (
                                                    <span className="text-zinc-400 dark:text-zinc-500 text-xs italic">
                                                        No action required
                                                    </span>
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



