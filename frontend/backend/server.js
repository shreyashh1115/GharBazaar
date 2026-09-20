const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes =
  require("./routes/authRoutes");

const propertyRoutes =
  require("./routes/propertyRoutes");

const uploadRoutes =
  require("./routes/uploadRoutes");

const favoriteRoutes =
  require("./routes/favoriteRoutes");

const enquiryRoutes =
  require("./routes/enquiryRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const enquiryMessageRoutes =
  require("./routes/enquiryMessageRoutes");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(
  express.json()
);


// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send(
    "GharBazaar Backend Running"
  );
});


// ===============================
// AUTH ROUTES
// ===============================

app.use(
  "/api/auth",
  authRoutes
);


// ===============================
// PROPERTY ROUTES
// ===============================

app.use(
  "/api/properties",
  propertyRoutes
);


// ===============================
// UPLOAD ROUTES
// ===============================

app.use(
  "/api/upload",
  uploadRoutes
);


// ===============================
// FAVORITE ROUTES
// ===============================

app.use(
  "/api/favorites",
  favoriteRoutes
);


// ===============================
// ENQUIRY ROUTES
// ===============================

app.use(
  "/api/enquiries",
  enquiryRoutes
);


// ===============================
// NOTIFICATION ROUTES
// ===============================

app.use(
  "/api/notifications",
  notificationRoutes
);


// ===============================
// ENQUIRY MESSAGE / REPLY ROUTES
// ===============================

app.use(
  "/api/enquiry-messages",
  enquiryMessageRoutes
);


// ===============================
// UPLOADS STATIC FOLDER
// ===============================

app.use(
  "/uploads",
  express.static("uploads")
);


// ===============================
// PORT
// ===============================

const PORT =
  process.env.PORT || 5000;


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
  .connect(
    process.env.MONGO_URI,
    {
      serverSelectionTimeoutMS: 10000,
    }
  )
  .then(() => {

    console.log(
      "MongoDB Connected Successfully"
    );

    app.listen(
      PORT,
      () => {

        console.log(
          `Server running on port ${PORT}`
        );

        console.log(
          "Auth routes loaded at /api/auth"
        );

        console.log(
          "Property routes loaded at /api/properties"
        );

        console.log(
          "Upload routes loaded at /api/upload"
        );

        console.log(
          "Favorite routes loaded at /api/favorites"
        );

        console.log(
          "Enquiry routes loaded at /api/enquiries"
        );

        console.log(
          "Notification routes loaded at /api/notifications"
        );

        console.log(
          "Enquiry message routes loaded at /api/enquiry-messages"
        );

      }
    );

  })
  .catch((error) => {

    console.log(
      "MongoDB Connection Failed:"
    );

    console.log(
      error.message
    );

  });