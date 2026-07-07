"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/auth.store";
import { AlertCircle, ArrowRight, BookMarked, BookOpen, CheckCircle2, Clock, Loader2, Plus, Users, XCircle } from "lucide-react";
import { useAdminBorrowsQuery, useDashboardStatsQuery } from "../../hooks/queries/useAdminQueries";

interface StatsData {
    totalBooks: number;
    totalStudents: number;
    pendingBorrows: number;
    approvedBorrows: number;
    overdueCount: number;
}

interface BorrowBook {
    book: { book: { title: string } };
}
interface RecentBorrow {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
    createdAt: string;
    user: { name: string };
    borrowBooks: BorrowBook[];
}

export default function DashboardPage() {
    const { admin } = useAuthStore();
    const { data: statsResponse, isLoading: statsLoading, error: statsError } = useDashboardStatsQuery();
    const { data: borrowsResponse, isLoading: borrowsLoading, error: borrowsError } = useAdminBorrowsQuery();

    const stats = statsResponse?.data ?? null;
    const recentActivity = (borrowsResponse?.data ?? []).slice(0, 6);
    const loading = statsLoading || borrowsLoading;
    const error = statsError || borrowsError ? "Failed to load dashboard statistics." : "";

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
        return `${diffDays}d ago`;
    };

    const getActivityText = (borrow: RecentBorrow) => {
        const student = borrow.user?.name || "A member";
        const bookNames = borrow.borrowBooks.map(bb => bb.book?.book?.title || "Unknown Book").join(", ");

        switch (borrow.status) {
            case "PENDING":
                return { text: `${student} requested ${bookNames}`, icon: Clock };
            case "APPROVED":
                return { text: `${student} has an active loan for ${bookNames}`, icon: BookOpen };
            case "RETURNED":
                return { text: `${student} returned ${bookNames}`, icon: CheckCircle2 };
            case "REJECTED":
                return { text: `${student}'s request for ${bookNames} was rejected`, icon: XCircle };
            default:
                return { text: `${student} request status updated`, icon: AlertCircle };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard...</p>
            </div>
        );
    }

    const statsCards = [
        { name: "Catalog Books", value: stats?.totalBooks ?? 0, icon: BookOpen, link: "/inventory" },
        { name: "Students", value: stats?.totalStudents ?? 0, icon: Users, link: "/students" },
        { name: "Pending Requests", value: stats?.pendingBorrows ?? 0, icon: Clock, link: "/requests" },
        { name: "Active Loans", value: stats?.approvedBorrows ?? 0, icon: BookMarked, link: "/requests" },
        { name: "Overdue Loans", value: stats?.overdueCount ?? 0, icon: AlertCircle, link: "/requests", warning: (stats?.overdueCount ?? 0) > 0 }
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-title">Dashboard</h1>
                    <p className="admin-subtitle">Welcome back{admin?.name ? `, ${admin.name}` : ""}. Review current library operations.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/students/create" className="admin-secondary-button">
                        <Plus className="h-4 w-4" /> Add Student
                    </Link>
                    <Link href="/inventory/create" className="admin-primary-button">
                        <Plus className="h-4 w-4" /> Add Book
                    </Link>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {statsCards.map((stat) => (
                    <Link key={stat.name} href={stat.link} className={`admin-panel-pad block transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${stat.warning ? "border-red-300 dark:border-red-900/70" : ""}`}>
                        <div className="flex items-start justify-between gap-3">
                            <stat.icon className={`h-5 w-5 ${stat.warning ? "text-red-600 dark:text-red-400" : "text-zinc-500"}`} />
                            <ArrowRight className="h-4 w-4 text-zinc-400" />
                        </div>
                        <p className="mt-5 text-3xl font-semibold text-zinc-950 dark:text-white">{stat.value}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">{stat.name}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="admin-panel lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                        <h2 className="font-semibold text-zinc-950 dark:text-white">Recent Borrow Activity</h2>
                        <Link href="/requests" className="text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white">View all</Link>
                    </div>

                    {recentActivity.length === 0 ? (
                        <div className="p-10 text-center text-sm text-zinc-500">No borrow activity found.</div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {recentActivity.map((activity) => {
                                const details = getActivityText(activity);
                                const ActivityIcon = details.icon;

                                return (
                                    <div key={activity.id} className="flex items-start gap-3 px-5 py-4">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 dark:border-zinc-800">
                                            <ActivityIcon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-zinc-950 dark:text-white">{details.text}</p>
                                            <p className="mt-1 text-xs text-zinc-500">{formatTimeAgo(activity.createdAt)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="admin-panel-pad">
                    <h2 className="font-semibold text-zinc-950 dark:text-white">Operational Shortcuts</h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Common admin tasks for the lending desk.</p>
                    <div className="mt-5 space-y-2">
                        <Link href="/requests" className="admin-secondary-button w-full justify-between">
                            Approval Queue <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/penalties" className="admin-secondary-button w-full justify-between">
                            Penalty Ledger <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/inventory" className="admin-secondary-button w-full justify-between">
                            Manage Copies <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


