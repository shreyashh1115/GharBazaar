const express = require("express");

const {
  createEnquiry,
  getSellerEnquiries,
  getBuyerEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} = require("../controllers/enquiryController");

const protect =
  require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// CREATE ENQUIRY
// ========================================

router.post(
  "/",
  protect,
  createEnquiry
);


// ========================================
// GET SELLER ENQUIRIES
// ========================================

router.get(
  "/seller",
  protect,
  getSellerEnquiries
);


// ========================================
// GET BUYER ENQUIRIES
// ========================================

router.get(
  "/buyer",
  protect,
  getBuyerEnquiries
);


// ========================================
// UPDATE ENQUIRY STATUS
// ========================================

router.put(
  "/:id/status",
  protect,
  updateEnquiryStatus
);


// ========================================
// DELETE ENQUIRY
// ========================================

router.delete(
  "/:id",
  protect,
  deleteEnquiry
);


module.exports = router;