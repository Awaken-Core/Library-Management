"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Book, User, Info, CheckCircle2, AlertTriangle, Loader2, Calendar, FileText, Globe, Bookmark } from "lucide-react";

export default function CreateBookPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        isbn: "",
        title: "",
        author: "",
        description: "",
        publisher: "",
        edition: "",
        language: "",
        publishedAt: "",
    });
    const [status, setStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: null, message: "" });

        try {
            setLoading(true);
            // publishedAt needs to be sent as Date string
            const payload = { ...formData, publishedAt: new Date(formData.publishedAt).toISOString() };
            const res = await api.post("/admin/books", payload);
            const bookId = res.data.data.id;
            setStatus({ type: "success", message: "Book added to inventory successfully. Redirecting to copies management..." });
            
            setTimeout(() => {
                router.push(`/inventory/${bookId}`);
            }, 1000);
        } catch (err: any) {
            setStatus({ 
                type: "error", 
                message: err.response?.data?.message || "Failed to add book" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Add New Book</h1>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 pl-13">Add a new book title to the library catalog.</p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

                {status.type === "success" && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                        className="p-4 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-2xl flex items-start gap-3"
                    >
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Success!</p>
                            <p className="text-sm opacity-90">{status.message}</p>
                        </div>
                    </motion.div>
                )}
                {status.type === "error" && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                        className="p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-3"
                    >
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Error</p>
                            <p className="text-sm opacity-90">{status.message}</p>
                        </div>
                    </motion.div>
                )}

                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 rounded-2xl text-sm flex items-start gap-3 relative z-10">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>
                        <strong>Note:</strong> After adding a book to the catalog, you will need to add specific physical copies (barcodes) to it from the inventory page before users can borrow it.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Book Title *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Book className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" name="title" required value={formData.title} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                    placeholder="e.g. Introduction to Algorithms"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">ISBN *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Bookmark className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" name="isbn" required minLength={10} maxLength={13} value={formData.isbn} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                    placeholder="e.g. 9780262033848"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Author(s) *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" name="author" required value={formData.author} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                    placeholder="e.g. Thomas H. Cormen"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Publisher</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" name="publisher" value={formData.publisher} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                    placeholder="e.g. MIT Press"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Publication Date *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <input 
                                    type="date" name="publishedAt" required value={formData.publishedAt} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Edition</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" name="edition" value={formData.edition} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                    placeholder="e.g. 3rd Edition"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Language</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" name="language" value={formData.language} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                    placeholder="e.g. English"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                            <textarea 
                                name="description" value={formData.description} onChange={handleChange} rows={3}
                                className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-none"
                                placeholder="Brief description or synopsis of the book..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 disabled:opacity-70 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>
                            ) : (
                                <><BookOpen className="w-5 h-5" /> Add Book to Catalog</>
                            )}
                        </button>
                        <Link 
                            href="/inventory"
                            className="px-6 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
