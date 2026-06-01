"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { BookOpen, Mail, Lock, ArrowRight, Loader2, GraduationCap } from "lucide-react";

export default function StudentLoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);
            const res = await api.post("/auth/login", { email, password });
            
            if (res.data.user.role !== "USER") {
                throw new Error("This portal is for students only.");
            }
            
            login(res.data.user, res.data.token);
            router.push("/");
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
            {/* Left side - Login Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative z-10 bg-white dark:bg-zinc-950 shadow-2xl shadow-zinc-200 dark:shadow-black">
                {/* Mobile branding */}
                <div className="lg:hidden flex items-center gap-2 mb-12 absolute top-8 left-8">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                    <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">Student Portal</span>
                </div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mx-auto"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
                            <GraduationCap className="w-4 h-4" /> Student Access
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Welcome to Library</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">Sign in with your email and initial password to browse the collection.</p>
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
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="student@university.edu"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-1.5">If you haven't changed your password, use your phone number.</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full relative group py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all shadow-lg shadow-blue-500/25 overflow-hidden mt-4"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> 
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Access Library
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Right side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1 relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-multiply dark:mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 text-center px-12"
                >
                    <div className="inline-flex items-center justify-center p-5 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl mb-8 shadow-2xl border border-white/20">
                        <BookOpen className="w-16 h-16 text-blue-700 dark:text-blue-400" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
                        Discover Your Next <br/>Great Read.
                    </h1>
                    <p className="text-lg text-zinc-700 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                        Access thousands of digital and physical books. Log in to reserve, borrow, and read anywhere.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
