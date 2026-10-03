const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const protect = require("../middleware/authMiddleware");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      )
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter,
});

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "gharbazaar/properties",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
  });
};

// SINGLE IMAGE
router.post(
  "/single",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image",
        });
      }

      const result = await uploadToCloudinary(
        req.file.buffer
      );

      return res.status(201).json({
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
        filename: result.public_id,
      });
    } catch (error) {
      console.log("CLOUDINARY UPLOAD ERROR:");
      console.log(error.message);

      return res.status(500).json({
        message:
          error.message ||
          "Image upload failed",
      });
    }
  }
);

// MULTIPLE IMAGES
router.post(
  "/multiple",
  protect,
  upload.array("images", 10),
  async (req, res) => {
    try {
      if (
        !req.files ||
        req.files.length === 0
      ) {
        return res.status(400).json({
          message:
            "Please select at least one image",
        });
      }

      const uploadedImages =
        await Promise.all(
          req.files.map((file) =>
            uploadToCloudinary(file.buffer)
          )
        );

      const imageUrls =
        uploadedImages.map(
          (result) => result.secure_url
        );

      return res.status(201).json({
        message:
          "Images uploaded successfully",
        imageUrls,
      });
    } catch (error) {
      console.log(
        "CLOUDINARY MULTIPLE UPLOAD ERROR:"
      );
      console.log(error.message);

      return res.status(500).json({
        message:
          error.message ||
          "Image upload failed",
      });
    }
  }
);

// UPLOAD ERROR HANDLER
router.use(
  (error, req, res, next) => {
    console.log("UPLOAD ERROR:");
    console.log(error.message);

    return res.status(400).json({
      message:
        error.message ||
        "Image upload failed",
    });
  }
);

module.exports = router;