const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");
const Notification = require("../models/Notification");


// ========================================
// CREATE ENQUIRY
// ========================================

const createEnquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        message: "Property ID is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const property = await Property.findById(
      propertyId
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Owner cannot send enquiry to own property
    if (
      property.owner &&
      property.owner.toString() ===
        req.user.id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot send enquiry for your own property",
      });
    }

    if (!property.owner) {
      return res.status(400).json({
        message:
          "Property owner not found",
      });
    }

    const enquiry = await Enquiry.create({
      property: propertyId,
      buyer: req.user.id,
      seller: property.owner,
      message: message.trim(),
    });

    const populatedEnquiry =
      await Enquiry.findById(enquiry._id)
        .populate(
          "property",
          "title price location images"
        )
        .populate(
          "buyer",
          "name email phone"
        )
        .populate(
          "seller",
          "name email phone"
        );

    // ========================================
    // CREATE SELLER NOTIFICATION
    // ========================================

    await Notification.create({
      user: property.owner,
      type: "Enquiry",
      title: "New Property Enquiry",
      message: `${populatedEnquiry.buyer.name} sent an enquiry for ${property.title}`,
      property: property._id,
      enquiry: enquiry._id,
    });

    res.status(201).json(
      populatedEnquiry
    );

  } catch (error) {

    console.log(
      "CREATE ENQUIRY ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// GET SELLER ENQUIRIES
// ========================================

const getSellerEnquiries = async (
  req,
  res
) => {
  try {

    const enquiries =
      await Enquiry.find({
        seller: req.user.id,
      })
        .populate(
          "property",
          "title price location images"
        )
        .populate(
          "buyer",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        });

    res.json(enquiries);

  } catch (error) {

    console.log(
      "GET SELLER ENQUIRIES ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// GET BUYER ENQUIRIES
// ========================================

const getBuyerEnquiries = async (
  req,
  res
) => {
  try {

    const enquiries =
      await Enquiry.find({
        buyer: req.user.id,
      })
        .populate(
          "property",
          "title price location images"
        )
        .populate(
          "seller",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        });

    res.json(enquiries);

  } catch (error) {

    console.log(
      "GET BUYER ENQUIRIES ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// UPDATE ENQUIRY STATUS
// ========================================

const updateEnquiryStatus = async (
  req,
  res
) => {
  try {

    const { status } = req.body;

    const allowedStatuses = [
      "New",
      "Contacted",
      "Closed",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid enquiry status",
      });
    }

    const enquiry =
      await Enquiry.findById(
        req.params.id
      );

    if (!enquiry) {
      return res.status(404).json({
        message:
          "Enquiry not found",
      });
    }

    // Only seller can update status
    if (
      enquiry.seller.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only property seller can update enquiry status",
      });
    }

    enquiry.status = status;

    await enquiry.save();

    await enquiry.populate(
      "property",
      "title price location images"
    );

    await enquiry.populate(
      "buyer",
      "name email phone"
    );

    await enquiry.populate(
      "seller",
      "name email phone"
    );

    // ========================================
    // CREATE BUYER NOTIFICATION
    // ========================================

    await Notification.create({
      user: enquiry.buyer._id,
      type: "EnquiryStatus",
      title: "Enquiry Status Updated",
      message: `Your enquiry status for ${enquiry.property.title} is now ${status}.`,
      property: enquiry.property._id,
      enquiry: enquiry._id,
    });

    res.json(enquiry);

  } catch (error) {

    console.log(
      "UPDATE ENQUIRY STATUS ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// DELETE ENQUIRY
// ========================================

const deleteEnquiry = async (
  req,
  res
) => {
  try {

    const enquiry =
      await Enquiry.findById(
        req.params.id
      );

    if (!enquiry) {
      return res.status(404).json({
        message:
          "Enquiry not found",
      });
    }

    const userId =
      req.user.id.toString();

    const buyerId =
      enquiry.buyer.toString();

    const sellerId =
      enquiry.seller.toString();

    // ========================================
    // ONLY BUYER OR SELLER CAN DELETE
    // ========================================

    if (
      userId !== buyerId &&
      userId !== sellerId
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this enquiry",
      });
    }

    // ========================================
    // DELETE ENQUIRY
    // ========================================

    await Enquiry.findByIdAndDelete(
      req.params.id
    );

    // ========================================
    // DELETE RELATED NOTIFICATIONS
    // ========================================

    await Notification.deleteMany({
      enquiry: req.params.id,
    });

    res.json({
      message:
        "Enquiry deleted successfully",
    });

  } catch (error) {

    console.log(
      "DELETE ENQUIRY ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
  createEnquiry,
  getSellerEnquiries,
  getBuyerEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
};