const Property = require("../models/Property");


// ================================
// GET ALL PROPERTIES
// ================================

const getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.json(properties);

  } catch (error) {
    console.log("GET PROPERTIES ERROR:");
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ================================
// GET SINGLE PROPERTY
// ================================

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(
      req.params.id
    ).populate("owner", "name email phone");

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    res.json(property);

  } catch (error) {
    console.log("GET PROPERTY ERROR:");
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ================================
// CREATE PROPERTY
// ================================

const createProperty = async (req, res) => {
  try {
    console.log("================================");
    console.log("PROPERTY DATA RECEIVED:");
    console.log(req.body);
    console.log("LOGGED IN USER:");
    console.log(req.user);
    console.log("================================");

    const {
      title,
      description,
      price,
      area,
      bedrooms,
      bathrooms,
      yearBuilt,
      location,
      propertyType,
      listingType,
      furnished,
      images,
      status,
    } = req.body;

    const finalListingType =
      listingType === "Rent"
        ? "Rent"
        : "Sale";

    const property = await Property.create({
      title,
      description,
      price,
      area,
      bedrooms,
      bathrooms,
      yearBuilt,
      location,
      propertyType,
      listingType: finalListingType,
      furnished,
      images,

      // Logged-in user automatically becomes owner
      owner: req.user.id,

      status,
    });

    console.log("================================");
    console.log("PROPERTY SAVED:");
    console.log(property);
    console.log("OWNER:");
    console.log(property.owner);
    console.log("================================");

    res.status(201).json({
      message: "Property added successfully",
      property,
    });

  } catch (error) {
    console.log("================================");
    console.log("CREATE PROPERTY ERROR:");
    console.log(error);
    console.log("================================");

    res.status(500).json({
      message: error.message,
    });
  }
};


// ================================
// UPDATE PROPERTY
// ================================

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(
      req.params.id
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Check property owner
    if (
      !property.owner ||
      property.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "You can only edit your own property",
      });
    }

    const updatedProperty =
      await Property.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    res.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });

  } catch (error) {
    console.log("UPDATE PROPERTY ERROR:");
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ================================
// DELETE PROPERTY
// ================================

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(
      req.params.id
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Check property owner
    if (
      !property.owner ||
      property.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own property",
      });
    }

    await Property.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Property deleted successfully",
    });

  } catch (error) {
    console.log("DELETE PROPERTY ERROR:");
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ================================
// EXPORT
// ================================

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};