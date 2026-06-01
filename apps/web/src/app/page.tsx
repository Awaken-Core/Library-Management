"use client";

import { useAuthStore } from "../store/auth.store";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, BookMarked, CalendarClock } from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <div>
            {/* Greeting Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-blue-500/20 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-blue-100 text-lg mb-8 max-w-xl leading-relaxed">
                        Ready to dive into a new world? You have 0 books currently borrowed. The library has just added 12 new arrivals this week.
                    </p>
                    
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                            <Search className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg"
                            placeholder="Search for books, authors, or ISBN..."
                        />
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                                <BookMarked className="w-5 h-5 text-blue-600" /> Featured Collection
                            </h2>
                            <button className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                                View all <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 cursor-pointer group"
                                >
                                    <div className="h-48 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                                        {/* Placeholder for book cover */}
                                        <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <span className="px-4 py-2 bg-white text-zinc-900 text-sm font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all">View Details</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 block">Science Fiction</span>
                                        <h3 className="font-bold text-zinc-900 dark:text-white mb-1 truncate">The Quantum Paradox</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Dr. Sarah Jenkins</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                            <CalendarClock className="w-5 h-5 text-blue-600" /> Current Borrowing
                        </h2>
                        
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="w-8 h-8 text-zinc-400" />
                            </div>
                            <p className="text-zinc-900 dark:text-white font-medium mb-1">No active borrowings</p>
                            <p className="text-sm text-zinc-500 max-w-[200px]">You haven't borrowed any books yet. Start exploring!</p>
                            <button className="mt-6 px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
                                Browse Library
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
