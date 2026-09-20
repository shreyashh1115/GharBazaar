const express = require("express");

const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favoriteController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Get logged-in user's favorites
router.get(
  "/",
  protect,
  getFavorites
);


// Add favorite
router.post(
  "/:propertyId",
  protect,
  addFavorite
);


// Remove favorite
router.delete(
  "/:propertyId",
  protect,
  removeFavorite
);


module.exports = router;