"use client";

import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useAuthStore } from "../../store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, hydrate } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        hydrate();
        setIsHydrated(true);
    }, [hydrate]);

    useEffect(() => {
        if (isHydrated && isAuthenticated) {
            router.push("/");
        }
    }, [isHydrated, isAuthenticated, router]);

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
            {children}
        </div>
    );
}
