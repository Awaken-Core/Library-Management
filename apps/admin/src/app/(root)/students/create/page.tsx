"use client";

import { useState } from "react";
import { useCreateStudentMutation } from "../../../../hooks/queries/useAdminQueries";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Mail, User, Phone, Info, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function CreateStudentPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNo: "",
    });
    const [status, setStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });
    const createStudentMutation = useCreateStudentMutation();
    const loading = createStudentMutation.isPending;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: null, message: "" });

        createStudentMutation.mutate(formData, {
            onSuccess: () => {
                setStatus({ type: "success", message: "Student account created successfully." });
                setFormData({ name: "", email: "", phoneNo: "" });
            },
            onError: () => {
                setStatus({ type: "error", message: "Failed to create student account" });
            },
        });
    };

    return (
        <div className="max-w-2xl mx-auto py-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Add New Student</h1>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 pl-13">Register a new student for library access and borrowing privileges.</p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

                {status.type === "success" && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                        className="p-4 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-lg flex items-start gap-3"
                    >
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Success!</p>
                            <p className="text-sm opacity-90">{status.message}</p>
                        </div>
                    </motion.div>
                )}
                {status.type === "error" && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                        className="p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-3"
                    >
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Error</p>
                            <p className="text-sm opacity-90">{status.message}</p>
                        </div>
                    </motion.div>
                )}

                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm flex items-start gap-3 relative z-10">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>
                        <strong>Important:</strong> The student's default password will be automatically set to their phone number. They will be required to change it upon their first login to the student portal.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                <User className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" name="name" required value={formData.name} onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                placeholder="Alex Smith"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input 
                                type="email" name="email" required value={formData.email} onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                placeholder="alex@library.edu"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number (Initial Password)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                <Phone className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" name="phoneNo" required value={formData.phoneNo} onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex items-center gap-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 disabled:opacity-70 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
                            ) : (
                                <><UserPlus className="w-5 h-5" /> Register Student</>
                            )}
                        </button>
                        <Link 
                            href="/"
                            className="px-6 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}


