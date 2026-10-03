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
    const property = await Property.findById(req.params.id)
      .populate("owner", "name email phone");

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

      // Always store images as array
      images: Array.isArray(images) ? images : [],

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
    console.log("================================");
    console.log("UPDATE PROPERTY");
    console.log("PROPERTY ID:", req.params.id);
    console.log("UPDATE DATA:", req.body);
    console.log("================================");

    // Find existing property
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // ================================
    // CHECK PROPERTY OWNER
    // ================================

    if (
      !property.owner ||
      property.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only edit your own property",
      });
    }

    // ================================
    // PREPARE UPDATE DATA
    // ================================

    const updateData = {
      ...req.body,
    };

    // Never allow owner to be changed from edit page
    delete updateData.owner;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // ================================
    // HANDLE IMAGES
    // ================================

    /*
      Important:

      If frontend sends images:
        use the new images array.

      If frontend does NOT send images:
        keep existing images.

      This prevents existing Cloudinary images
      from disappearing during normal property edits.
    */

    if (Object.prototype.hasOwnProperty.call(req.body, "images")) {
      if (Array.isArray(req.body.images)) {
        updateData.images = req.body.images.filter(
          (image) =>
            typeof image === "string" &&
            image.trim() !== ""
        );
      } else {
        // If invalid images value is sent,
        // keep old images.
        updateData.images = property.images || [];
      }
    } else {
      // Images were not part of this edit request.
      // Preserve existing images.
      updateData.images = property.images || [];
    }

    // ================================
    // UPDATE DATABASE
    // ================================

    const updatedProperty =
      await Property.findByIdAndUpdate(
        req.params.id,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("owner", "name email phone");

    console.log("================================");
    console.log("PROPERTY UPDATED:");
    console.log(updatedProperty);
    console.log("UPDATED IMAGES:");
    console.log(updatedProperty.images);
    console.log("================================");

    res.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.log("================================");
    console.log("UPDATE PROPERTY ERROR:");
    console.log(error);
    console.log("================================");

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
    const property = await Property.findById(req.params.id);

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
        message: "You can only edit your own property",
      });
    }

    await Property.findByIdAndDelete(req.params.id);

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