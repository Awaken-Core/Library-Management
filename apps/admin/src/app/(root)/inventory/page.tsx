"use client";

import React, { useState } from "react";
import { BookOpen, Eye, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useAdminBooksQuery } from "../../../hooks/queries/useAdminQueries";

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: booksResponse, isLoading: loading, error: queryError } = useAdminBooksQuery(searchTerm);
    const books = booksResponse?.data ?? [];
    const error = queryError ? "Failed to load book inventory." : "";

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-title flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-zinc-500" />
                        Book Inventory
                    </h1>
                    <p className="admin-subtitle">Maintain catalog records and manage physical copy availability.</p>
                </div>
                <Link href="/inventory/create" className="admin-primary-button">
                    <Plus className="h-4 w-4" /> Add Book
                </Link>
            </div>

            <div className="admin-panel">
                <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by title, author, or ISBN"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-icon-input"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />
                    </div>
                ) : error ? (
                    <div className="p-10 text-center">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            <BookOpen className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="font-medium text-zinc-950 dark:text-white">No books found</h3>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                            {searchTerm ? "No catalog entries match your search." : "Start by adding the first book to the catalog."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="admin-table whitespace-nowrap">
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>ISBN</th>
                                    <th>Publisher</th>
                                    <th className="text-center">Copies</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book) => (
                                    <tr key={book.id}>
                                        <td>
                                            <div className="max-w-md">
                                                <Link href={`/inventory/${book.id}`} className="font-medium text-zinc-950 hover:underline dark:text-white">
                                                    {book.title}
                                                </Link>
                                                <p className="mt-0.5 text-xs text-zinc-500">{book.author}</p>
                                            </div>
                                        </td>
                                        <td className="text-zinc-600 dark:text-zinc-300">{book.isbn}</td>
                                        <td className="text-zinc-600 dark:text-zinc-300">{book.publisher || "-"}</td>
                                        <td className="text-center">
                                            <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${book.availableCopies > 0 ? "border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300" : "border-red-200 text-red-700 dark:border-red-900/60 dark:text-red-400"}`}>
                                                {book.availableCopies} available
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <Link href={`/inventory/${book.id}`} className="admin-secondary-button py-1.5 text-xs">
                                                <Eye className="h-3.5 w-3.5" /> View
                                            </Link>
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



