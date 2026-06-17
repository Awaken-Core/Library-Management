"use client";

import { useAuthGuard } from "../hooks/useAuthGuard";
import { useAuthStore } from "../store/auth.store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, UserCircle, History, LogOut, Menu, X, Loader2, Search, Bell, BellRing, Check, MailOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../lib/api";

const NAV_ITEMS = [
    { name: "Browse Collection", href: "/", icon: Search },
    { name: "My Books", href: "/my-books", icon: BookOpen },
    { name: "Borrowing History", href: "/history", icon: History },
    { name: "Profile", href: "/profile", icon: UserCircle },
];

export function ClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Notifications state
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    
    // Skip guard for login page
    const isLoginPage = pathname === "/login";
    
    const { isHydrated, isAuthenticated } = useAuthGuard();
    const { user, logout } = useAuthStore();

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications");
            if (res.data.success) {
                setNotifications(res.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Poll for notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const markAllNotificationsRead = async () => {
        try {
            await api.patch("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

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

    const unreadCount = notifications.filter(n => !n.read).length;

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

                    <div className="flex items-center gap-4 relative">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`p-2 rounded-full transition-colors relative hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isNotificationsOpen ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"}`}
                            >
                                {unreadCount > 0 ? (
                                    <BellRing className="w-5 h-5 text-blue-600 dark:text-blue-500 animate-pulse" />
                                ) : (
                                    <Bell className="w-5 h-5" />
                                )}
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center animate-bounce">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50 focus:outline-none"
                                        >
                                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                                <span className="font-bold text-sm text-zinc-900 dark:text-white">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button 
                                                        onClick={markAllNotificationsRead}
                                                        className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>

                                            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-zinc-500 text-xs">
                                                        <MailOpen className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                                                        No notifications yet.
                                                    </div>
                                                ) : (
                                                    notifications.map((n) => (
                                                        <div 
                                                            key={n.id} 
                                                            onClick={() => {
                                                                if (!n.read) markAsRead(n.id);
                                                            }}
                                                            className={`p-4 flex gap-3 text-left transition-colors cursor-pointer ${n.read ? "opacity-60 hover:bg-zinc-50 dark:hover:bg-zinc-800/20" : "bg-blue-50/50 dark:bg-blue-900/5 hover:bg-blue-50 dark:hover:bg-blue-900/10"}`}
                                                        >
                                                            <div className="mt-1 shrink-0">
                                                                {!n.read ? (
                                                                    <span className="block w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                                                                ) : (
                                                                    <Check className="w-3.5 h-3.5 text-zinc-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-xs text-zinc-900 dark:text-white">{n.title}</p>
                                                                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 leading-normal">{n.message}</p>
                                                                <p className="text-[9px] text-zinc-400 mt-1">{formatTimeAgo(n.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

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
