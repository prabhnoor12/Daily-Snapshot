import { asyncHandler } from "../utils/asyncHandler.js";
import * as notificationService from "../services/notificationService.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { redis, checkAndRefreshRedisConnection } from '../config/redis.js';

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Assuming user is available in request
  const { page = 1, limit = 10 } = req.query;
  const notifications = await notificationService.getUserNotifications(
    userId,
    parseInt(page),
    parseInt(limit)
  );
  res.status(200).json(new ApiResponse(200, notifications));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await notificationService.markAllAsRead(userId);
  res.status(200).json(new ApiResponse(200, "All notifications marked as read"));
});

const deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await notificationService.deleteNotification(parseInt(id));
    res.status(200).json(new ApiResponse(200, "Notification deleted"));
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    await notificationService.deleteAllNotifications(userId);
    res.status(200).json(new ApiResponse(200, "All notifications deleted"));
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationService.markAsRead(parseInt(id));
  res.status(200).json(new ApiResponse(200, notification));
});

const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { preferences } = req.body;
  await notificationService.updateNotificationPreferences(userId, preferences);
  res.status(200).json(new ApiResponse(200, "Notification preferences updated"));
});

export {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  updateNotificationPreferences,
};
