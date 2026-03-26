const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getReminders,
  createReminder,
  deleteReminder,
} = require("../controllers/remindersController");

// @route   GET /api/reminders
router.get("/", verifyToken, getReminders);

// @route   POST /api/reminders
router.post("/", verifyToken, createReminder);

// @route   DELETE /api/reminders/:id
router.delete("/:id", verifyToken, deleteReminder);

module.exports = router;
