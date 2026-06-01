"use client";

import Link from "next/link";
import { useAuthStore } from "../../store/auth.store";
import { motion } from "framer-motion";
import { BookOpen, Users, AlertCircle, Plus, TrendingUp, Clock, ArrowRight } from "lucide-react";

export default function DashboardPage() {
    const { admin } = useAuthStore();

    const stats = [
        { name: 'Total Books', value: '1,248', icon: BookOpen, change: '+12%', color: 'bg-blue-500' },
        { name: 'Active Students', value: '842', icon: Users, change: '+4.3%', color: 'bg-green-500' },
        { name: 'Pending Returns', value: '43', icon: AlertCircle, change: '-2.1%', color: 'bg-orange-500' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Welcome back, {admin?.name}. Here's what's happening today.</p>
                </div>
                <Link 
                    href="/students/create"
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    New Student
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 ${stat.color}`}></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                                <stat.icon className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                            </div>
                            <div className={`text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                stat.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'
                            }`}>
                                {stat.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 relative z-10">{stat.name}</h3>
                        <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white relative z-10">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800"
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                                <div className="w-2 h-2 mt-2 rounded-full bg-primary/40"></div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Alex Smith borrowed "The Great Gatsby"</p>
                                    <p className="text-xs text-zinc-500 mt-1">{i * 2} hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent border border-primary/20 dark:border-primary/10 p-6 rounded-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                    <h3 className="text-xl font-bold text-primary mb-2 relative z-10">Library System V1 is Live</h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-6 max-w-sm relative z-10">
                        You can now easily manage students. In upcoming phases, we will introduce full book inventory and borrowing mechanics.
                    </p>
                    <Link href="/students/create" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline relative z-10">
                        Try adding a student <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}