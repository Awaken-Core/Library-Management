"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/auth.store";
import { motion } from "framer-motion";
import { 
    BookOpen, 
    Users, 
    AlertCircle, 
    Plus, 
    Clock, 
    ArrowRight, 
    Loader2, 
    CheckCircle2, 
    XCircle, 
    BookMarked,
    CalendarCheck,
    CalendarClock
} from "lucide-react";
import { api } from "../../lib/api";

interface StatsData {
    totalBooks: number;
    totalStudents: number;
    pendingBorrows: number;
    approvedBorrows: number;
    overdueCount: number;
}

interface BookDetail {
    title: string;
}
interface BookCopy {
    book: BookDetail;
}
interface BorrowBook {
    book: BookCopy;
}
interface UserDetail {
    name: string;
}
interface RecentBorrow {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
    createdAt: string;
    user: UserDetail;
    borrowBooks: BorrowBook[];
}

export default function DashboardPage() {
    const { admin } = useAuthStore();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentBorrow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");
                
                // Fetch stats and borrows concurrently
                const [statsRes, borrowsRes] = await Promise.all([
                    api.get("/admin/stats"),
                    api.get("/admin/borrows")
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
                
                if (borrowsRes.data.success) {
                    // Take the first 5 records as recent activity
                    const allBorrows = borrowsRes.data.data || [];
                    setRecentActivity(allBorrows.slice(0, 5));
                }
            } catch (err: any) {
                console.error("Dashboard load error:", err);
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago (${date.toLocaleDateString("en-IN")})`;
    };

    const getActivityText = (borrow: RecentBorrow) => {
        const student = borrow.user?.name || "A member";
        const bookNames = borrow.borrowBooks.map(bb => bb.book?.book?.title || "Unknown Book").join(", ");
        
        switch (borrow.status) {
            case "PENDING":
                return {
                    text: `${student} requested to borrow "${bookNames}"`,
                    icon: Clock,
                    iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                };
            case "APPROVED":
                return {
                    text: `${student} picked up "${bookNames}"`,
                    icon: BookOpen,
                    iconColor: "text-green-500 bg-green-50 dark:bg-green-500/10"
                };
            case "RETURNED":
                return {
                    text: `${student} returned "${bookNames}"`,
                    icon: CheckCircle2,
                    iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/10"
                };
            case "REJECTED":
                return {
                    text: `Borrow request from ${student} for "${bookNames}" was rejected`,
                    icon: XCircle,
                    iconColor: "text-red-500 bg-red-50 dark:bg-red-500/10"
                };
            default:
                return {
                    text: `${student} request status updated to ${borrow.status}`,
                    icon: AlertCircle,
                    iconColor: "text-zinc-500 bg-zinc-50 dark:bg-zinc-500/10"
                };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">Loading stats dashboard...</p>
            </div>
        );
    }

    // Prepare stats grid config
    const statsCards = [
        { 
            name: "Total Catalog Books", 
            value: stats?.totalBooks ?? 0, 
            icon: BookOpen, 
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/5",
            link: "/inventory"
        },
        { 
            name: "Registered Members", 
            value: stats?.totalStudents ?? 0, 
            icon: Users, 
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-500/5",
            link: "/students"
        },
        { 
            name: "Pending Requests", 
            value: stats?.pendingBorrows ?? 0, 
            icon: Clock, 
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/5",
            link: "/requests"
        },
        { 
            name: "Active Loans", 
            value: stats?.approvedBorrows ?? 0, 
            icon: BookMarked, 
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/5",
            link: "/requests"
        },
        { 
            name: "Overdue Loans", 
            value: stats?.overdueCount ?? 0, 
            icon: CalendarClock, 
            color: (stats?.overdueCount ?? 0) > 0 ? "text-red-600 dark:text-red-400 font-bold" : "text-zinc-500",
            bg: (stats?.overdueCount ?? 0) > 0 ? "bg-red-500/10 border-red-200 dark:border-red-900/50" : "bg-zinc-500/5",
            link: "/requests"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Admin Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Welcome back, {admin?.name}. Here's the current library status.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Link 
                        href="/students/create"
                        className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/10 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Member
                    </Link>
                    <Link 
                        href="/inventory/create"
                        className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Book
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                {statsCards.map((stat, i) => (
                    <motion.div 
                        key={stat.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className={`bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group flex flex-col justify-between h-36 ${stat.name.includes("Overdue") && (stats?.overdueCount ?? 0) > 0 ? "border-red-300 dark:border-red-950 shadow-sm" : ""}`}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full blur-2xl -mr-8 -mt-8 ${stat.bg}`}></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <Link href={stat.link} className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 p-1">
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest relative z-10">{stat.name}</h3>
                            <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white relative z-10 mt-1">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Recent Activity logs */}
                <div className="lg:col-span-2">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col"
                    >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4 text-zinc-950 dark:text-white">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Recent Borrowing Activity
                        </h3>
                        
                        {recentActivity.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                                <Clock className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">No borrow activity logs found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 flex-1">
                                {recentActivity.map((activity) => {
                                    const details = getActivityText(activity);
                                    const ActivityIcon = details.icon;
                                    
                                    return (
                                        <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${details.iconColor}`}>
                                                <ActivityIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                                    {details.text}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1 font-medium">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTimeAgo(activity.createdAt)}
                                                </p>
                                            </div>
                                            <Link 
                                                href="/requests" 
                                                className="px-2 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 rounded"
                                            >
                                                Manage
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right 1 Column: General Info / Help */}
                <div>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 dark:border-blue-500/15 p-6 rounded-3xl relative overflow-hidden h-full flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                        
                        <div className="relative z-10 space-y-4">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Library Administration</span>
                            <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white leading-snug">LMS Control Center V1</h3>
                            <p className="text-zinc-500 dark:text-zinc-300 text-sm leading-relaxed max-w-sm">
                                As an administrator, you have full control over book metadata, member creation, and loan workflow approvals. Make sure copies have unique barcodes before they are distributed.
                            </p>
                        </div>
                        
                        <div className="mt-8 relative z-10 border-t border-blue-500/10 pt-6 space-y-3">
                            <Link href="/requests" className="flex items-center justify-between text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                <span>Go to Approval Queue</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/inventory" className="flex items-center justify-between text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                <span>Manage Catalog & Copies</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}