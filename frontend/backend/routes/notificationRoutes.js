const express = require("express");

const {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

const protect =
  require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getNotifications
);

router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

router.put(
  "/read-all",
  protect,
  markAllNotificationsRead
);

router.put(
  "/:id/read",
  protect,
  markNotificationRead
);

module.exports = router;