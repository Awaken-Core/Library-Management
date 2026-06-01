"use client";

import { useAuthGuard } from "../hooks/useAuthGuard";
import { useAuthStore } from "../store/auth.store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, UserCircle, History, LogOut, Menu, X, Loader2, Search } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
    { name: "Browse Collection", href: "/", icon: Search },
    { name: "My Books", href: "#", icon: BookOpen },
    { name: "Borrowing History", href: "#", icon: History },
    { name: "Profile", href: "#", icon: UserCircle },
];

export function ClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Skip guard for login page
    const isLoginPage = pathname === "/login";
    
    const { isHydrated, isAuthenticated } = useAuthGuard();
    const { user, logout } = useAuthStore();

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!isAuthenticated) {
        return null; // Auth guard will redirect
    }

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
            {/* Top Navigation */}
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white hidden sm:block">Library<span className="text-blue-600 font-normal">Student</span></span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link 
                                    key={item.name} 
                                    href={item.href}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        isActive 
                                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" 
                                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{user?.name}</span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="hidden md:flex p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
                            title="Log out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                        
                        {/* Mobile menu button */}
                        <button 
                            className="md:hidden p-2 -mr-2 text-zinc-600 dark:text-zinc-400"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-16 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="p-4 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link 
                                    key={item.name} 
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                                        isActive 
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <button 
                                onClick={handleLogout}
                                className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
