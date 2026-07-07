"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Eye, Loader2, Plus, Search, ShieldBan, Users } from "lucide-react";
import AlertModal from "../components/AlertModal";
import Link from "next/link";
import { useAdminUsersQuery, useToggleUserBanMutation } from "../../../hooks/queries/useAdminQueries";

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
    const [searchTerm, setSearchTerm] = useState("");
    const { data: usersResponse, isLoading: loading, error: queryError } = useAdminUsersQuery();
    const toggleBanMutation = useToggleUserBanMutation();
    const error = queryError ? "Failed to load students." : "";

    const students = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return (usersResponse?.data ?? []).filter((u: Student) => {
            if (u.role !== "USER") return false;
            if (!lowerSearch) return true;
            return u.name.toLowerCase().includes(lowerSearch) || u.email.toLowerCase().includes(lowerSearch) || u.phoneNo?.toLowerCase().includes(lowerSearch);
        });
    }, [searchTerm, usersResponse?.data]);

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info" | "warning";
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info"
    });

    const showAlert = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "info") => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    const toggleBanStatus = (studentId: string) => {
        toggleBanMutation.mutate(studentId, {
            onError: (err) => {
                console.error("Failed to update ban status", err);
                showAlert("Error", "Failed to update ban status", "error");
            },
        });
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-title flex items-center gap-2">
                        <Users className="h-5 w-5 text-zinc-500" />
                        Students
                    </h1>
                    <p className="admin-subtitle">Review member records, borrowing access, and account status.</p>
                </div>
                <Link href="/students/create" className="admin-primary-button">
                    <Plus className="h-4 w-4" /> Add Student
                </Link>
            </div>

            <div className="admin-panel">
                <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-icon-input"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />
                    </div>
                ) : error ? (
                    <div className="p-10 text-center">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            <Users className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="font-medium text-zinc-950 dark:text-white">No students found</h3>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                            {searchTerm ? "No students match your search." : "Create a student account to begin issuing books."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="admin-table whitespace-nowrap">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Contact</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>
                                            <div>
                                                <p className="font-medium text-zinc-950 dark:text-white">{student.name}</p>
                                                <p className="mt-0.5 text-xs text-zinc-500">Joined {new Date(student.createdAt).toLocaleDateString("en-IN")}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="text-zinc-700 dark:text-zinc-300">{student.email}</p>
                                                <p className="mt-0.5 text-xs text-zinc-500">{student.phoneNo || "No phone"}</p>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${student.isBanned ? "border-red-200 text-red-700 dark:border-red-900/60 dark:text-red-400" : "border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"}`}>
                                                {student.isBanned ? "Banned" : "Active"}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/students/${student.id}`} className="admin-secondary-button py-1.5 text-xs">
                                                    <Eye className="h-3.5 w-3.5" /> View
                                                </Link>
                                                <button
                                                    onClick={() => toggleBanStatus(student.id)}
                                                    className={student.isBanned ? "admin-secondary-button py-1.5 text-xs" : "admin-danger-button py-1.5 text-xs"}
                                                >
                                                    {student.isBanned ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldBan className="h-3.5 w-3.5" />}
                                                    {student.isBanned ? "Unban" : "Ban"}
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


