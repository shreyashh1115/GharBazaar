const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications =
      await Notification.find({
        user: req.user.id,
      })
        .populate(
          "property",
          "title price location images"
        )
        .populate(
          "enquiry",
          "status message"
        )
        .sort({
          createdAt: -1,
        });

    res.json(notifications);
  } catch (error) {
    console.log(
      "GET NOTIFICATIONS ERROR:"
    );
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getUnreadCount = async (
  req,
  res
) => {
  try {
    const count =
      await Notification.countDocuments({
        user: req.user.id,
        isRead: false,
      });

    res.json({
      count,
    });
  } catch (error) {
    console.log(
      "GET UNREAD COUNT ERROR:"
    );
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const markNotificationRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!notification) {
      return res.status(404).json({
        message:
          "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.json({
      message:
        "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log(
      "MARK NOTIFICATION READ ERROR:"
    );
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const markAllNotificationsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user: req.user.id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

      res.json({
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.log(
        "MARK ALL NOTIFICATIONS READ ERROR:"
      );
      console.log(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};