const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// UPLOAD FOLDER
// ========================================

const uploadFolder = path.join(
  __dirname,
  "..",
  "uploads"
);

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true,
  });
}


// ========================================
// STORAGE
// ========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const filename =
      `${Date.now()}-${Math.round(
        Math.random() * 1E9
      )}${extension}`;

    cb(null, filename);
  },
});


// ========================================
// FILE FILTER
// ========================================

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      )
    );
  }
};


// ========================================
// MULTER
// ========================================

const upload = multer({
  storage,

  limits: {
    fileSize:
      5 * 1024 * 1024,

    files: 10,
  },

  fileFilter,
});


// ========================================
// SINGLE IMAGE UPLOAD
// ========================================

router.post(
  "/single",
  protect,
  upload.single("image"),
  (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          message:
            "Please select an image",
        });
      }

      const imageUrl =
        `https://gharbazaar-hb8d.onrender.com/uploads/${req.file.filename}`;

      console.log(
        "IMAGE UPLOADED:"
      );

      console.log(
        req.file.filename
      );

      return res.status(201).json({

        message:
          "Image uploaded successfully",

        imageUrl,

        filename:
          req.file.filename,
      });

    } catch (error) {

      console.log(
        "UPLOAD ERROR:"
      );

      console.log(error);

      return res.status(500).json({

        message:
          error.message ||
          "Image upload failed",

      });

    }

  }
);


// ========================================
// MULTIPLE IMAGE UPLOAD
// ========================================

router.post(
  "/multiple",
  protect,
  upload.array("images", 10),
  (req, res) => {

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

      const imageUrls =
        req.files.map((file) => {

          return `https://gharbazaar-hb8d.onrender.com/uploads/${file.filename}`;

        });


      console.log(
        "================================"
      );

      console.log(
        "MULTIPLE IMAGES UPLOADED:"
      );

      console.log(
        imageUrls
      );

      console.log(
        "================================"
      );


      return res.status(201).json({

        message:
          "Images uploaded successfully",

        imageUrls,

      });

    } catch (error) {

      console.log(
        "MULTIPLE UPLOAD ERROR:"
      );

      console.log(error);

      return res.status(500).json({

        message:
          error.message ||
          "Image upload failed",

      });

    }

  }
);


// ========================================
// MULTER ERROR HANDLER
// ========================================

router.use(
  (error, req, res, next) => {

    console.log(
      "MULTER ERROR:"
    );

    console.log(
      error.message
    );

    return res.status(400).json({

      message:
        error.message ||
        "Image upload failed",

    });

  }
);


module.exports = router;