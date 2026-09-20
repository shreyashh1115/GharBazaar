const express = require("express");

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const protect =
  require("../middleware/authMiddleware");

const router =
  express.Router();


// REGISTER
router.post(
  "/register",
  registerUser
);


// LOGIN
router.post(
  "/login",
  loginUser
);


// GET PROFILE
router.get(
  "/me",
  protect,
  getProfile
);


// UPDATE PROFILE
router.put(
  "/profile",
  protect,
  updateProfile
);


// CHANGE PASSWORD
router.put(
  "/change-password",
  protect,
  changePassword
);


module.exports = router;