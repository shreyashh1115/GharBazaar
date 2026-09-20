const User = require("../models/User");
const Property = require("../models/Property");


// ========================================
// ADD PROPERTY TO FAVORITES
// ========================================

const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.propertyId;

    // Check property exists
    const property = await Property.findById(
      propertyId
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Find logged-in user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check already favorite
    const alreadyFavorite =
      user.favorites.some(
        (id) =>
          id.toString() === propertyId
      );

    if (alreadyFavorite) {
      return res.status(400).json({
        message:
          "Property is already in favorites",
      });
    }

    // Add property
    user.favorites.push(propertyId);

    await user.save();

    res.json({
      message:
        "Property added to favorites",
      favorite: true,
    });

  } catch (error) {
    console.log(
      "ADD FAVORITE ERROR:"
    );
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// REMOVE PROPERTY FROM FAVORITES
// ========================================

const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.propertyId;

    const user = await User.findById(
      userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.favorites =
      user.favorites.filter(
        (id) =>
          id.toString() !== propertyId
      );

    await user.save();

    res.json({
      message:
        "Property removed from favorites",
      favorite: false,
    });

  } catch (error) {
    console.log(
      "REMOVE FAVORITE ERROR:"
    );
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// GET MY FAVORITES
// ========================================

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(
      userId
    ).populate({
      path: "favorites",
      populate: {
        path: "owner",
        select: "name email phone",
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(
      user.favorites
    );

  } catch (error) {
    console.log(
      "GET FAVORITES ERROR:"
    );
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};