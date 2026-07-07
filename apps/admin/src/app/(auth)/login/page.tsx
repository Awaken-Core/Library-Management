"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetupCheck } from "../../../hooks/useSetupCheck";
import { useAuthStore } from "../../../store/auth.store";
import { useLoginAdminMutation } from "../../../hooks/queries/useAuthQueries";
import Link from "next/link";
import { motion } from "framer-motion";
import { Library, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const { isLoading, adminExists } = useSetupCheck();
    const router = useRouter();
    const { login } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const loginMutation = useLoginAdminMutation();
    const loading = loginMutation.isPending;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }
    
    if (adminExists === false) {
        router.push("/setup");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        loginMutation.mutate({ email, password }, {
            onSuccess: (res) => {
                if (res.user?.role !== "ADMIN") {
                    setError("Unauthorized access. Admin privileges required.");
                    return;
                }
                login(res.user, res.token);
                router.push("/");
            },
            onError: () => setError("Login failed"),
        });
    };

    return (
        <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
            {/* Left side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1 relative bg-zinc-900 overflow-hidden items-center justify-center">
                {/* Background effects */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 text-center px-12"
                >
                    <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-2xl border border-white/10">
                        <Library className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                        Library<span className="text-primary">Admin</span>
                    </h1>
                    <p className="text-lg text-zinc-300 max-w-md mx-auto leading-relaxed">
                        The complete management system for your library's operations, students, and inventory.
                    </p>
                </motion.div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative">
                {/* Mobile branding */}
                <div className="lg:hidden flex items-center gap-2 mb-12 absolute top-8 left-8">
                    <Library className="w-6 h-6 text-primary" />
                    <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">LibraryAdmin</span>
                </div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mx-auto"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <ShieldCheck className="w-4 h-4" /> Secure Admin Portal
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Welcome back</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">Enter your credentials to access the dashboard</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                    placeholder="admin@library.com"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full relative group py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-70 transition-all shadow-lg shadow-zinc-900/20 dark:shadow-white/10 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> 
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In to Dashboard
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            {/* Hover effect gradient */}
                            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

