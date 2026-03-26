const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getNotifications,
  markNotificationSent,
} = require("../controllers/notificationsController");

// @route   GET /api/notifications
router.get("/", verifyToken, getNotifications);

// @route   PUT /api/notifications/:id
router.put("/:id", verifyToken, markNotificationSent);

module.exports = router;
