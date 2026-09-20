const mongoose = require("mongoose");


const propertySchema =
  new mongoose.Schema(

    {

      title: {
        type: String,
        required: true,
      },


      description: {
        type: String,
      },


      price: {
        type: Number,
        required: true,
      },


      area: {
        type: Number,
        required: true,
      },


      bedrooms: {
        type: Number,
        required: true,
      },


      bathrooms: {
        type: Number,
        required: true,
      },


      yearBuilt: {
        type: Number,
      },


      location: {
        type: String,
        required: true,
      },


      propertyType: {

        type: String,

        enum: [
          "House",
          "Flat",
          "Villa",
          "Plot",
        ],

        required: true,

      },


      listingType: {

        type: String,

        enum: [
          "Sale",
          "Rent",
        ],

        required: true,

        default: "Sale",

      },


      furnished: {

        type: String,

        enum: [
          "Furnished",
          "Semi-Furnished",
          "Unfurnished",
        ],

      },


      // ========================================
      // MULTIPLE PROPERTY IMAGES
      // ========================================

      images: [

        {
          type: String,
        },

      ],


      owner: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

      },


      status: {

        type: String,

        enum: [
          "Available",
          "Sold",
        ],

        default: "Available",

      },

    },

    {
      timestamps: true,
    }

  );


module.exports =
  mongoose.model(
    "Property",
    propertySchema
  );