"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, BookMarked, CalendarClock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useBooksQuery } from "../hooks/queries/useBooks";
import { useMyBorrowsQuery } from "../hooks/queries/useBorrows";

type Book = {
    id: string;
    title: string;
    author: string;
    description: string;
    publishedAt: string;
    bookCopies: Array<{ id: string; status: string }>;
};

type Borrow = {
    id: string;
    status: string;
    borrowDate: string;
    returnDate: string | null;
    returnedOn: string | null;
    borrowBooks: Array<{
        book: {
            book: {
                title: string;
                author: string;
            }
        }
    }>;
};

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: booksData, isLoading: loadingBooks } = useBooksQuery(
        debouncedSearchTerm ? { search: debouncedSearchTerm } : undefined
    );
    const books: Book[] = booksData?.data || [];

    const { data: borrowsData, isLoading: loadingBorrows } = useMyBorrowsQuery();
    const borrows: Borrow[] = borrowsData?.data || [];

    const activeBorrows = borrows.filter(b => b.status === "APPROVED" && !b.returnedOn);
    const totalBorrowedBooks = activeBorrows.reduce((sum, b) => sum + b.borrowBooks.length, 0);

    return (
        <div>
            {/* Greeting Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-blue-500/20 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                        Welcome back, {user?.name?.split(' ')[0] || "Student"}!
                    </h1>
                    <p className="text-blue-100 text-lg mb-8 max-w-xl leading-relaxed">
                        Ready to dive into a new world? You have {totalBorrowedBooks} books currently borrowed. Check out our featured collection below.
                    </p>
                    
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                            <Search className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg"
                            placeholder="Search for books, authors, or ISBN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                <BookMarked className="w-5 h-5 text-blue-600" /> {searchTerm ? "Search Results" : "Featured Collection"}
                            </h2>
                        </div>
                        
                        {loadingBooks ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : books.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
                                <p className="text-zinc-500">No books found matching your search.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {books.map((book) => (
                                    <Link href={`/books/${book.id}`} key={book.id} className="block h-full">
                                        <motion.div 
                                            whileHover={{ y: -5 }}
                                            className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 cursor-pointer group flex flex-col h-full"
                                        >
                                            <div className="h-48 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center shrink-0">
                                                {/* Placeholder for book cover */}
                                                <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <span className="px-4 py-2 bg-white text-zinc-900 text-sm font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all">View Details</span>
                                                </div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 block">Book</span>
                                                <h3 className="font-bold text-zinc-900 dark:text-white mb-1 line-clamp-2">{book.title}</h3>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-auto">{book.author}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                            <CalendarClock className="w-5 h-5 text-blue-600" /> Current Borrowing
                        </h2>
                        
                        {loadingBorrows ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            </div>
                        ) : activeBorrows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen className="w-8 h-8 text-zinc-400" />
                                </div>
                                <p className="text-zinc-900 dark:text-white font-medium mb-1">No active borrowings</p>
                                <p className="text-sm text-zinc-500 max-w-[200px]">You haven't borrowed any books yet. Start exploring!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeBorrows.map(borrow => (
                                    <div key={borrow.id} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">Approved</span>
                                            <span className="text-xs text-zinc-500">Return by: {borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {borrow.borrowBooks.map((item, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="w-8 h-10 bg-zinc-200 dark:bg-zinc-700 rounded flex-shrink-0 flex items-center justify-center">
                                                        <BookOpen className="w-4 h-4 text-zinc-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-1">{item.book.book.title}</p>
                                                        <p className="text-xs text-zinc-500 line-clamp-1">{item.book.book.author}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
