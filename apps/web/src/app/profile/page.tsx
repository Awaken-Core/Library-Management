"use client";

import React, { useEffect, useState } from 'react';
import { 
    UserCircle, 
    Settings, 
    Shield, 
    Loader2, 
    AlertTriangle, 
    CheckCircle2, 
    Edit2, 
    Save, 
    X,
    Lock,
    KeyRound
} from "lucide-react";
import { useStudentProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from "../../hooks/queries/useStudent";

type UserProfile = {
    id: string;
    name: string;
    email: string;
    phoneNo: string;
    role: string;
    isBanned: boolean;
    createdAt: string;
    subscriptions: Array<{
        endDate: string;
    }>;
    penalties: Array<{
        id: string;
        amount: string;
    }>;
};

export default function ProfilePage() {
    const { data: queryData, isLoading: loading, error: queryError } = useStudentProfileQuery();
    const profile = queryData?.data || null;
    const error = queryError ? ((queryError as any).response?.data?.message || (queryError as any).message || "Failed to load profile") : "";

    // Profile edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });

    const { mutateAsync: updateProfile, isPending: savingProfile } = useUpdateProfileMutation();

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });

    const { mutateAsync: changePassword, isPending: savingPassword } = useChangePasswordMutation();

    useEffect(() => {
        if (profile && !isEditing) {
            setEditName(profile.name);
            setEditPhone(profile.phoneNo);
        }
    }, [profile]);

    const handleEditToggle = () => {
        if (isEditing && profile) {
            // Restore original values on cancel
            setEditName(profile.name);
            setEditPhone(profile.phoneNo);
        }
        setIsEditing(!isEditing);
        setProfileStatus({ type: null, message: "" });
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileStatus({ type: null, message: "" });

        try {
            await updateProfile({ name: editName, phoneNo: editPhone });
            setProfileStatus({ type: "success", message: "Profile details updated successfully." });
            setIsEditing(false);
        } catch (err: any) {
            setProfileStatus({
                type: "error",
                message: err.response?.data?.message || "Failed to update profile details."
            });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordStatus({ type: null, message: "" });

        if (newPassword !== confirmPassword) {
            setPasswordStatus({ type: "error", message: "Passwords do not match." });
            return;
        }

        try {
            await changePassword({ currentPassword, newPassword });
            setPasswordStatus({ type: "success", message: "Password updated successfully." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setPasswordStatus({
                type: "error",
                message: err.response?.data?.message || "Failed to change password. Make sure current password is correct."
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-6 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" />
                <div>
                    <h3 className="font-semibold text-lg">Error loading profile</h3>
                    <p className="opacity-90">{error}</p>
                </div>
            </div>
        );
    }

    const pendingPenalties = profile.penalties.reduce((sum: number, penalty: any) => sum + parseFloat(penalty.amount), 0);
    const hasActiveSubscription = profile.subscriptions.length > 0;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-16">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white flex items-center gap-3">
                    <UserCircle className="w-8 h-8 text-blue-600" />
                    My Profile
                </h1>
                
                <button
                    onClick={handleEditToggle}
                    className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all ${isEditing ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300" : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
                >
                    {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
                </button>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="h-36 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <div className="absolute top-0 right-0 w-64 h-36 bg-white/10 blur-[60px] rounded-full"></div>
                </div>
                <div className="px-8 pb-8 relative">
                    <div className="w-24 h-24 bg-white dark:bg-zinc-850 rounded-full border-4 border-white dark:border-zinc-900 absolute -top-12 flex items-center justify-center text-3xl font-black text-blue-600 shadow-md">
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="pt-16">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {profile.name}
                            </h2>
                            {profile.isBanned && (
                                <span className="px-2.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400 text-xs font-bold rounded-lg uppercase tracking-wider border border-red-200 dark:border-red-900/30 animate-pulse">
                                    Banned
                                </span>
                            )}
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{profile.email}</p>
                        
                        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column (2/3): Profile Info / Edit Form */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-6 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl">
                                    <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2 mb-6">
                                        <Settings className="w-5 h-5 text-zinc-400" /> 
                                        Account Details
                                    </h3>

                                    {profileStatus.type === "success" && (
                                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                            <span>{profileStatus.message}</span>
                                        </div>
                                    )}
                                    {profileStatus.type === "error" && (
                                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-2 text-sm">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                            <span>{profileStatus.message}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSaveProfile} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address (Locked)</label>
                                                <input 
                                                    type="email" 
                                                    value={profile.email} 
                                                    className="w-full p-3 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-500 cursor-not-allowed" 
                                                    disabled 
                                                />
                                            </div>
                                            
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={editName} 
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className={`w-full p-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 ${isEditing ? "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800" : "bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/50 dark:border-zinc-800/20 cursor-not-allowed"}`}
                                                    disabled={!isEditing || savingProfile} 
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone Number</label>
                                                <input 
                                                    type="tel" 
                                                    required
                                                    value={editPhone} 
                                                    onChange={(e) => setEditPhone(e.target.value)}
                                                    className={`w-full p-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 ${isEditing ? "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800" : "bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/50 dark:border-zinc-800/20 cursor-not-allowed"}`}
                                                    disabled={!isEditing || savingProfile} 
                                                />
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="pt-4 flex items-center gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={savingProfile}
                                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10"
                                                >
                                                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleEditToggle}
                                                    className="px-5 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-100 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>

                                {/* CHANGE PASSWORD CARD */}
                                <div className="p-6 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl">
                                    <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2 mb-6">
                                        <KeyRound className="w-5 h-5 text-zinc-400" /> 
                                        Change Password
                                    </h3>

                                    {passwordStatus.type === "success" && (
                                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                            <span>{passwordStatus.message}</span>
                                        </div>
                                    )}
                                    {passwordStatus.type === "error" && (
                                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-2 text-sm">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                            <span>{passwordStatus.message}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                                placeholder="Enter current password"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">New Password</label>
                                                <input 
                                                    type="password" 
                                                    required
                                                    minLength={6}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                                    placeholder="Minimum 6 characters"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Confirm New Password</label>
                                                <input 
                                                    type="password" 
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                                                    placeholder="Re-type new password"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={savingPassword || !currentPassword || !newPassword}
                                            className="w-full py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                                        >
                                            {savingPassword ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                                            ) : (
                                                <><Lock className="w-4 h-4" /> Settle New Password</>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                            
                            {/* Right Column (1/3): Account status card */}
                            <div className="space-y-6">
                                <div className="p-6 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                                    <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-zinc-400" /> Account Status
                                    </h3>
                                    
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3.5 shadow-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-zinc-500">Membership</span>
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${hasActiveSubscription ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {hasActiveSubscription ? 'Active Subscription' : 'No Active Plan'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-3.5">
                                            <span className="text-xs font-semibold text-zinc-500">Pending Fines</span>
                                            <span className={`text-sm font-black ${pendingPenalties > 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>
                                                ₹{pendingPenalties.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {!hasActiveSubscription && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-xl flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <p>
                                                You do not have an active membership plan. Please contact the library administrator to renew your access.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
