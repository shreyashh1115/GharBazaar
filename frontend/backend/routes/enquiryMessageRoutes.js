const express = require("express");

const {
  sendReply,
  getEnquiryMessages,
  getUnreadMessageCount,
} = require("../controllers/enquiryMessageController");

const protect =
  require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  sendReply
);

router.get(
  "/unread-count",
  protect,
  getUnreadMessageCount
);

router.get(
  "/:enquiryId",
  protect,
  getEnquiryMessages
);

module.exports = router;