"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Search, Filter, Loader2, MoreVertical } from "lucide-react";
import Link from 'next/link';
import { api } from "../../../lib/api";

type Book = {
    id: string;
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    publishedAt: string;
    availableCopies: number;
    createdAt: string;
};

export default function InventoryPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/books?search=${searchTerm}`);
                setBooks(res.data.data);
            } catch (error) {
                console.error("Failed to fetch books", error);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchBooks();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Book Inventory
                </h1>
                <Link href="/inventory/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" /> Add Book
                </Link>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Search books by title or author..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
                
                {loading ? (
                    <div className="p-12 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : books.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                            <BookOpen className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No books found</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mb-6">There are currently no books matching your search.</p>
                        {searchTerm === "" && (
                            <Link href="/inventory/create" className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                                <Plus className="w-4 h-4" /> Add First Book
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Book Details</th>
                                    <th className="px-6 py-4 font-medium">ISBN</th>
                                    <th className="px-6 py-4 font-medium">Publisher</th>
                                    <th className="px-6 py-4 font-medium text-center">Available Copies</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {books.map((book) => (
                                    <tr key={book.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/inventory/${book.id}`} className="flex flex-col group">
                                                <span className="font-medium text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:underline transition-colors">{book.title}</span>
                                                <span className="text-zinc-500 text-xs">{book.author}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{book.isbn}</td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{book.publisher || "-"}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    book.availableCopies > 0 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                                                }`}>
                                                    {book.availableCopies} available
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
