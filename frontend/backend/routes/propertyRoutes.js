const express = require("express");

const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProperties);

router.get("/:id", getPropertyById);

// Login required
router.post("/", protect, createProperty);

// Login required
router.put("/:id", protect, updateProperty);

// Login required
router.delete("/:id", protect, deleteProperty);

module.exports = router;