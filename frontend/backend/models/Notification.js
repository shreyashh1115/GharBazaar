const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      type: {
        type: String,
        enum: [
          "Enquiry",
          "EnquiryStatus",
          "EnquiryReply",
          "General",
        ],
        default: "General",
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        default: null,
      },

      enquiry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enquiry",
        default: null,
      },

      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Notification",
    notificationSchema
  );