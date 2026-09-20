const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ========================================
// REGISTER
// ========================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const existingUser =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email:
          email.toLowerCase(),
        password:
          hashedPassword,
        phone:
          phone || "",
        role:
          role || "User",
      });

    res.status(201).json({
      message:
        "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "REGISTER ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// LOGIN
// ========================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email:
          email.toLowerCase(),
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const token =
      jwt.sign(
        {
          id:
            user._id.toString(),

          role:
            user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            "7d",
        }
      );

    res.json({
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone:
          user.phone || "",
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "LOGIN ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// GET MY PROFILE
// ========================================

const getProfile = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone:
          user.phone || "",
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "GET PROFILE ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// UPDATE PROFILE
// ========================================

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message:
          "Name and email are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // Check if email already belongs
    // to another user

    const existingUser =
      await User.findOne({
        email:
          normalizedEmail,
        _id: {
          $ne: req.user.id,
        },
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "This email is already registered",
      });
    }

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    user.name =
      name.trim();

    user.email =
      normalizedEmail;

    user.phone =
      phone || "";

    await user.save();

    console.log(
      "PROFILE UPDATED:"
    );

    console.log(
      user.email
    );

    res.json({
      message:
        "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone:
          user.phone || "",
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "UPDATE PROFILE ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// CHANGE PASSWORD
// ========================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Current password and new password are required",
      });
    }

    if (
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters",
      });
    }

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(400).json({
        message:
          "Current password is incorrect",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    await user.save();

    console.log(
      "PASSWORD CHANGED FOR:"
    );

    console.log(
      user.email
    );

    res.json({
      message:
        "Password changed successfully",
    });

  } catch (error) {
    console.log(
      "CHANGE PASSWORD ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
};