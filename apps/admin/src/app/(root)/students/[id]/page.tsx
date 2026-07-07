"use client";

import React from "react";
import { useParams, useRouter } from 'next/navigation';
import { useAdminUserQuery } from "../../../../hooks/queries/useAdminQueries";
import { UserCircle, Mail, Phone, Calendar, ArrowLeft, BookOpen, AlertTriangle, CheckCircle2, IndianRupee } from "lucide-react";
import Link from 'next/link';

export default function StudentDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const studentId = Array.isArray(id) ? id[0] : id;
    const { data: studentResponse, isLoading: loading, error: queryError } = useAdminUserQuery(studentId);
    const student = studentResponse?.data ?? null;
    const error = queryError ? "Failed to load student details" : "";

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="space-y-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Students
                </button>
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-6 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6" />
                    <div>
                        <h3 className="font-semibold text-lg">Error loading details</h3>
                        <p className="opacity-90">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const totalBorrowed = student.borrowsUser.length;
    const currentlyBorrowed = student.borrowsUser.filter(b => b.status === 'APPROVED' && !b.returnedOn).length;
    const pendingFines = student.penalties.reduce((sum, penalty) => sum + parseFloat(penalty.amount), 0);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Student Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="h-32 bg-zinc-100 dark:bg-zinc-800"></div>
                    <div className="px-8 pb-8 relative">
                        <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-full border-4 border-white dark:border-zinc-900 absolute -top-12 flex items-center justify-center text-3xl font-bold text-primary shadow-md">
                            {student.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="pt-16 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                                    {student.name}
                                    {student.isBanned && (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs font-semibold rounded-md uppercase tracking-wider">
                                            Banned
                                        </span>
                                    )}
                                </h2>
                                <p className="text-zinc-500 flex items-center gap-2 mt-1"><Calendar className="w-4 h-4" /> Joined {new Date(student.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-500 font-medium">Email Address</p>
                                        <p className="text-sm text-zinc-900 dark:text-white truncate font-medium">{student.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-500 font-medium">Phone Number</p>
                                        <p className="text-sm text-zinc-900 dark:text-white truncate font-medium">{student.phoneNo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500 mb-1">Total Borrowed</p>
                            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{totalBorrowed}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mb-4">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500 mb-1">Currently Borrowing</p>
                            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{currentlyBorrowed}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center mb-4">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500 mb-1">Pending Fines</p>
                            <p className="text-3xl font-bold text-zinc-900 dark:text-white">Rs. {pendingFines.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Pending Fines Details */}
                    {student.penalties.length > 0 && (
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" /> Pending Penalties
                                </h3>
                            </div>
                            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {student.penalties.map(penalty => (
                                    <div key={penalty.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-white">{penalty.reason}</p>
                                            <p className="text-xs text-zinc-500 mt-1">Issued on {new Date(penalty.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="font-bold text-red-600 dark:text-red-400">
                                            Rs. {parseFloat(penalty.amount).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Borrow History */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Borrow History</h3>
                        </div>
                        {student.borrowsUser.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                                <p>No borrow history found for this student.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Books</th>
                                            <th className="px-6 py-4 font-medium">Date Borrowed</th>
                                            <th className="px-6 py-4 font-medium text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                        {student.borrowsUser.map(borrow => (
                                            <tr key={borrow.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 max-w-xs whitespace-normal">
                                                        {borrow.borrowBooks.map((item, idx) => (
                                                            <div key={idx} className="font-medium text-zinc-900 dark:text-white">
                                                                {item.book.book.title}
                                                                <span className="block text-xs text-zinc-500 font-normal">Barcode: {item.book.barcode}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-zinc-600 dark:text-zinc-300">
                                                        {new Date(borrow.borrowDate).toLocaleDateString()}
                                                    </span>
                                                    {borrow.returnedOn && (
                                                        <span className="block text-xs text-green-600 dark:text-green-400 mt-1">
                                                            Returned: {new Date(borrow.returnedOn).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            borrow.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' :
                                                            borrow.status === 'RETURNED' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' :
                                                            borrow.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                                                            'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                                                        }`}>
                                                            {borrow.status}
                                                        </span>
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
            </div>
        </div>
    );
}



