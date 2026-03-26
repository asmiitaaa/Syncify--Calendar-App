const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventsController");

// @route   GET /api/events
router.get("/", verifyToken, getEvents);

// @route   GET /api/events/:id
router.get("/:id", verifyToken, getEventById);

// @route   POST /api/events
router.post("/", verifyToken, createEvent);

// @route   PUT /api/events/:id
router.put("/:id", verifyToken, updateEvent); //WE ADD VERIFY TOKEN TO THE ROUTE TO ASK THE MIDDLEWARE TO VERIFY THE TOKEN OF THE USER PASSING THIS REQUEST

// @route   DELETE /api/events/:id
router.delete("/:id", verifyToken, deleteEvent);

module.exports = router;
