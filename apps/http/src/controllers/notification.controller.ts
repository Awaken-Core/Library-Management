import type { Request, Response } from "express";
import { client } from "@repo/db";

export const getMyNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const notifications = await client.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to fetch notifications", error });
    }
};

export const markRead = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.user!.id;

        const notification = await client.notification.findUnique({
            where: { id }
        });

        if (!notification) {
            res.status(404).json({ success: false, message: "Notification not found" });
            return;
        }

        if (notification.userId !== userId) {
            res.status(403).json({ success: false, message: "Forbidden: You cannot modify this notification" });
            return;
        }

        const updated = await client.notification.update({
            where: { id },
            data: { read: true }
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to mark read", error });
    }
};

export const markAllRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        await client.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });

        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to mark all read", error });
    }
};
