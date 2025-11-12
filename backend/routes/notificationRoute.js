import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  updateNotificationPreferences,
} from "../controllers/notification_controller.js";
import { verifyAuth as authMiddleware } from "../middleware/auth_middlware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.put("/preferences", updateNotificationPreferences);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markNotificationAsRead);
router.delete("/:id", deleteNotification);
router.delete("/", deleteAllNotifications);

export default router;
