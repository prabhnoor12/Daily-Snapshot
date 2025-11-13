import sgMail from '@sendgrid/mail';
import prisma from "../config/prisma.js";
import logger from '../utils/logger.js';
import { ApiError } from '../utils/apiError.js';

// Allowed notification types mirrored from Prisma enum NotificationType
const allowedNotificationTypes = ['system','new_feature','billing','marketing','other'];

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailNotification = async (userId, message, type) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.email) {
      const wantsEmail = user.notificationPreferences?.[type]?.email ?? true; // Default to true if not set
      if (!wantsEmail) {
        logger.info(`User ${userId} has opted out of email notifications for type ${type}`);
        return;
      }

      const msg = {
        to: user.email,
        from: 'your-verified-sendgrid-email@example.com', // Change to your verified sender
        subject: 'New Notification',
        text: message,
        html: `<strong>${message}</strong>`,
      };
      await sgMail.send(msg);
      logger.info(`Email notification sent to user ${userId}`);
    }
  } catch (error) {
    logger.error({
      message: `Error sending email to user ${userId}`,
      error: error,
      response: error.response ? error.response.body : null,
    }, 'Email sending failed');
    // We don't re-throw here because a failed email shouldn't fail the main operation
  }
};

const createNotification = async (userId, message, type) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const wantsInApp = user.notificationPreferences?.[type]?.inApp ?? true; // Default to true if not set

    if (!wantsInApp) {
      logger.info(`User ${userId} has opted out of in-app notifications for type ${type}`);
      // Still send email if they want it
      await sendEmailNotification(userId, message, type);
      return null;
    }

    // Normalize & validate type
    let normalizedType = typeof type === 'string' ? type.toLowerCase() : 'other';
    if (!allowedNotificationTypes.includes(normalizedType)) {
      normalizedType = 'other';
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        type: normalizedType,
      },
    });
    await sendEmailNotification(userId, message, type); // Send email notification
    return notification;
  } catch (error) {
    logger.error({
        message: `Failed to create notification for user ${userId}`,
        error: error
    }, 'Notification creation failed');
    throw new ApiError(500, 'Could not create notification.');
  }
};

const getUserNotifications = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    return await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });
  } catch (error) {
    logger.error({
        message: `Failed to get notifications for user ${userId}`,
        error: error
    }, 'Get notifications failed');
    throw new ApiError(500, 'Could not retrieve notifications.');
  }
};

const markAsRead = async (notificationId) => {
  try {
    return await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    logger.error({
        message: `Failed to mark notification ${notificationId} as read`,
        error: error
    }, 'Mark as read failed');
    throw new ApiError(500, 'Could not mark notification as read.');
  }
};

const markAllAsRead = async (userId) => {
  try {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    logger.error({
        message: `Failed to mark all notifications as read for user ${userId}`,
        error: error
    }, 'Mark all as read failed');
    throw new ApiError(500, 'Could not mark all notifications as read.');
  }
};

const deleteNotification = async (notificationId) => {
  try {
    return await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });
  } catch (error) {
    logger.error({
        message: `Failed to delete notification ${notificationId}`,
        error: error
    }, 'Delete notification failed');
    throw new ApiError(500, 'Could not delete notification.');
  }
};

const deleteAllNotifications = async (userId) => {
  try {
    return await prisma.notification.deleteMany({
        where: {
            userId,
        },
    });
  } catch (error) {
    logger.error({
        message: `Failed to delete all notifications for user ${userId}`,
        error: error
    }, 'Delete all notifications failed');
    throw new ApiError(500, 'Could not delete all notifications.');
  }
};

const updateNotificationPreferences = async (userId, preferences) => {
  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        notificationPreferences: preferences,
      },
    });
  } catch (error) {
    logger.error({
        message: `Failed to update notification preferences for user ${userId}`,
        error: error
    }, 'Update notification preferences failed');
    throw new ApiError(500, 'Could not update notification preferences.');
  }
};

export {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  updateNotificationPreferences,
};
