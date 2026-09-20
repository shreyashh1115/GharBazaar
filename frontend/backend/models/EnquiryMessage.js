const mongoose = require("mongoose");

const enquiryMessageSchema =
  new mongoose.Schema(
    {
      enquiry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enquiry",
        required: true,
      },

      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
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
    "EnquiryMessage",
    enquiryMessageSchema
  );