const express = require("express");
const router = express.Router();

// placeholder
router.get("/", (req, res) => res.json({ message: "auth route working" }));

module.exports = router;
