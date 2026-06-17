"use client";

import React, { useEffect, useState } from 'react';
import { Users, Search, Filter, Loader2, MoreVertical, ShieldBan, CheckCircle2 } from "lucide-react";
import AlertModal from '../components/AlertModal';
import Link from 'next/link';
import { api } from "../../../lib/api";

type Student = {
    id: string;
    name: string;
    email: string;
    phoneNo: string;
    role: string;
    isBanned: boolean;
    createdAt: string;
};

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
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

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/users`);
            // Filter to show only students (USER role) and optionally filter by search term
            const filtered = res.data.data.filter((u: Student) => {
                if (u.role !== 'USER') return false;
                if (!searchTerm) return true;
                const lowerSearch = searchTerm.toLowerCase();
                return u.name.toLowerCase().includes(lowerSearch) || u.email.toLowerCase().includes(lowerSearch);
            });
            setStudents(filtered);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchStudents();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const toggleBanStatus = async (studentId: string) => {
        try {
            await api.patch(`/admin/users/${studentId}/ban`);
            fetchStudents(); // Refresh the list
        } catch (error) {
            console.error("Failed to update ban status", error);
            showAlert("Error", "Failed to update ban status", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Students Directory
                </h1>
                <Link href="/students/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                    Add Student
                </Link>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Search students by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
                
                {loading ? (
                    <div className="p-12 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : students.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                            <Users className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No students found</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mb-6">There are currently no students matching your search.</p>
                        {searchTerm === "" && (
                            <Link href="/students/create" className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                                Add First Student
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Student Info</th>
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-900 dark:text-white">{student.name}</span>
                                                <span className="text-zinc-500 text-xs">Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-600 dark:text-zinc-300">{student.email}</span>
                                                <span className="text-zinc-500 text-xs">{student.phoneNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    !student.isBanned 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                                                }`}>
                                                    {student.isBanned ? 'Banned' : 'Active'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/students/${student.id}`}
                                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors inline-flex items-center justify-center gap-1 text-xs font-medium"
                                                >
                                                    View Details
                                                </Link>
                                                <button 
                                                    onClick={() => toggleBanStatus(student.id)}
                                                    className={`p-2 rounded-lg transition-colors inline-flex items-center justify-center gap-1 text-xs font-medium ${
                                                        student.isBanned 
                                                            ? "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30" 
                                                            : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                                    }`}
                                                >
                                                    {student.isBanned ? <><CheckCircle2 className="w-4 h-4" /> Unban</> : <><ShieldBan className="w-4 h-4" /> Ban</>}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
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
