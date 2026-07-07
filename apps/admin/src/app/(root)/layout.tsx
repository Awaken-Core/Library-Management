"use client";

import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useAuthStore } from "../../store/auth.store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CircleDollarSign, LayoutDashboard, Library, Loader2, LogOut, Menu, Settings, Users, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Books", href: "/inventory", icon: BookOpen },
    { name: "Members", href: "/students", icon: Users },
    { name: "Borrow", href: "/requests", icon: Settings },
    { name: "Penalty", href: "/penalties", icon: CircleDollarSign },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { isHydrated, isAuthenticated } = useAuthGuard();
    const { admin, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!isHydrated || !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white lg:flex">
            <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
                <div className="flex items-center gap-2 font-semibold">
                    <Library className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                    Library Admin
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" aria-label="Toggle menu">
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-16 items-center border-b border-zinc-200 px-5 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800">
                            <Library className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold leading-tight">Library Admin</p>
                            <p className="text-xs text-zinc-500">Management</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"}`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="mb-2 rounded-md bg-zinc-50 p-3 dark:bg-zinc-950">
                        <p className="truncate text-sm font-medium text-zinc-950 dark:text-white">{admin?.name || "Admin"}</p>
                        <p className="truncate text-xs text-zinc-500">{admin?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
                        <LogOut className="h-4 w-4" />
                        Log out
                    </button>
                </div>
            </aside>

            <main className="min-w-0 flex-1 pt-14 lg:pt-0">
                <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
            </main>

            {isMobileMenuOpen && <button className="fixed inset-0 z-30 bg-zinc-950/40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" />}
        </div>
    );
}

