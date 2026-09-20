const EnquiryMessage = require("../models/EnquiryMessage");
const Enquiry = require("../models/Enquiry");
const Notification = require("../models/Notification");
const Property = require("../models/Property");

// SEND REPLY
const sendReply = async (req, res) => {
  try {
    const {
      enquiryId,
      message,
    } = req.body;

    if (!enquiryId) {
      return res.status(400).json({
        message:
          "Enquiry ID is required",
      });
    }

    if (
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        message:
          "Message is required",
      });
    }

    const enquiry =
      await Enquiry.findById(
        enquiryId
      ).populate(
        "property",
        "title price location images"
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

    // Only buyer or seller can reply
    if (
      userId !== buyerId &&
      userId !== sellerId
    ) {
      return res.status(403).json({
        message:
          "You are not part of this enquiry",
      });
    }

    // Decide receiver
    const receiver =
      userId === sellerId
        ? enquiry.buyer
        : enquiry.seller;

    // Create message
    const newMessage =
      await EnquiryMessage.create({
        enquiry: enquiryId,
        sender: req.user.id,
        receiver: receiver,
        message:
          message.trim(),
      });

    // Populate message
    const populatedMessage =
      await EnquiryMessage.findById(
        newMessage._id
      )
        .populate(
          "sender",
          "name email phone"
        )
        .populate(
          "receiver",
          "name email phone"
        )
        .populate(
          "enquiry",
          "property status"
        );

    // Get sender name
    const senderName =
      populatedMessage.sender?.name ||
      "User";

    // Get property title
    const propertyTitle =
      enquiry.property?.title ||
      "your property";

    // Create notification for receiver
    await Notification.create({
      user: receiver,

      type: "EnquiryReply",

      title: "New Enquiry Reply",

      message: `${senderName} replied to your enquiry for ${propertyTitle}`,

      property:
        enquiry.property?._id || null,

      enquiry:
        enquiry._id,
    });

    res.status(201).json(
      populatedMessage
    );

  } catch (error) {
    console.log(
      "SEND REPLY ERROR:"
    );
    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// GET ENQUIRY MESSAGES
const getEnquiryMessages =
  async (req, res) => {
    try {
      const {
        enquiryId,
      } = req.params;

      const enquiry =
        await Enquiry.findById(
          enquiryId
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

      // Only buyer or seller can view messages
      if (
        userId !== buyerId &&
        userId !== sellerId
      ) {
        return res.status(403).json({
          message:
            "You are not part of this enquiry",
        });
      }

      const messages =
        await EnquiryMessage.find({
          enquiry: enquiryId,
        })
          .populate(
            "sender",
            "name email phone"
          )
          .populate(
            "receiver",
            "name email phone"
          )
          .sort({
            createdAt: 1,
          });

      // Mark received messages as read
      await EnquiryMessage.updateMany(
        {
          enquiry: enquiryId,
          receiver: req.user.id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

      res.json(messages);

    } catch (error) {
      console.log(
        "GET ENQUIRY MESSAGES ERROR:"
      );
      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };


// GET UNREAD MESSAGE COUNT
const getUnreadMessageCount =
  async (req, res) => {
    try {
      const count =
        await EnquiryMessage.countDocuments(
          {
            receiver:
              req.user.id,

            isRead: false,
          }
        );

      res.json({
        count,
      });

    } catch (error) {
      console.log(
        "GET UNREAD MESSAGE COUNT ERROR:"
      );
      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };


module.exports = {
  sendReply,
  getEnquiryMessages,
  getUnreadMessageCount,
};