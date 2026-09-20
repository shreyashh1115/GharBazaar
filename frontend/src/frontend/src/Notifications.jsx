import { useEffect, useState } from "react";

function Notifications({
  token,
  onViewProperty,
}) {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ========================================
  // FETCH NOTIFICATIONS
  // ========================================

  const fetchNotifications = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "https://gharbazaar-hb8d.onrender.com/api/notifications",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setNotifications(data);
      }
    } catch (error) {
      console.log(
        "FETCH NOTIFICATIONS ERROR:",
        error
      );
    }
  };

  // ========================================
  // FETCH UNREAD COUNT
  // ========================================

  const fetchUnreadCount = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "https://gharbazaar-hb8d.onrender.com/api/notifications/unread-count",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setUnreadCount(
          data.count || 0
        );
      }
    } catch (error) {
      console.log(
        "FETCH UNREAD COUNT ERROR:",
        error
      );
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchNotifications();
    fetchUnreadCount();

    const interval =
      setInterval(() => {
        fetchUnreadCount();
      }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [token]);

  // ========================================
  // OPEN NOTIFICATIONS
  // ========================================

  const handleNotificationClick =
    async (notification) => {
      try {
        if (!notification.isRead) {
          await fetch(
            `https://gharbazaar-hb8d.onrender.com/api/notifications/${notification._id}/read`,
            {
              method: "PUT",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          setNotifications(
            (previous) =>
              previous.map(
                (item) =>
                  item._id ===
                  notification._id
                    ? {
                        ...item,
                        isRead: true,
                      }
                    : item
              )
          );

          setUnreadCount(
            (previous) =>
              Math.max(
                0,
                previous - 1
              )
          );
        }

        if (
          notification.property &&
          onViewProperty
        ) {
          const propertyId =
            notification.property._id ||
            notification.property;

          setShowNotifications(false);

          onViewProperty(
            propertyId
          );
        }
      } catch (error) {
        console.log(
          "MARK NOTIFICATION READ ERROR:",
          error
        );
      }
    };

  // ========================================
  // MARK ALL AS READ
  // ========================================

  const markAllAsRead = async () => {
    if (
      unreadCount === 0
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://gharbazaar-hb8d.onrender.com/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );

        setUnreadCount(0);
      }
    } catch (error) {
      console.log(
        "MARK ALL READ ERROR:",
        error
      );
    }

    setLoading(false);
  };

  // ========================================
  // DELETE NOTIFICATION
  // ========================================

  const deleteNotification =
    async (
      notificationId
    ) => {
      try {
        const response =
          await fetch(
            `https://gharbazaar-hb8d.onrender.com/api/notifications/${notificationId}`,
            {
              method: "DELETE",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (response.ok) {
          const deleted =
            notifications.find(
              (item) =>
                item._id ===
                notificationId
            );

          setNotifications(
            (previous) =>
              previous.filter(
                (item) =>
                  item._id !==
                  notificationId
              )
          );

          if (
            deleted &&
            !deleted.isRead
          ) {
            setUnreadCount(
              (previous) =>
                Math.max(
                  0,
                  previous - 1
                )
            );
          }
        }
      } catch (error) {
        console.log(
          "DELETE NOTIFICATION ERROR:",
          error
        );
      }
    };

  // ========================================
  // DATE FORMAT
  // ========================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      {/* NOTIFICATION BUTTON */}

      <button
        type="button"
        onClick={() => {
          setShowNotifications(
            (previous) =>
              !previous
          );

          if (
            !showNotifications
          ) {
            fetchNotifications();
          }
        }}
        style={{
          position: "relative",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: "23px",
          padding: "8px",
          lineHeight: 1,
        }}
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0px",
              right: "0px",
              minWidth: "18px",
              height: "18px",
              padding: "0 4px",
              borderRadius: "20px",
              background: "#e53935",
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white",
              boxSizing: "border-box",
            }}
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* NOTIFICATION DROPDOWN */}

      {showNotifications && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: "0",
            width: "370px",
            maxWidth:
              "calc(100vw - 30px)",
            background: "white",
            borderRadius: "12px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.15)",
            border:
              "1px solid #eeeeee",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* HEADER */}

          <div
            style={{
              padding: "15px 16px",
              borderBottom:
                "1px solid #eeeeee",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "17px",
                  color: "#222",
                }}
              >
                Notifications
              </h3>

              {unreadCount > 0 && (
                <p
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize: "12px",
                    color: "#777",
                  }}
                >
                  {unreadCount} unread
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                disabled={loading}
                style={{
                  border: "none",
                  background:
                    "transparent",
                  color: "#14786b",
                  cursor:
                    loading
                      ? "default"
                      : "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {loading
                  ? "Updating..."
                  : "Mark all as read"}
              </button>
            )}
          </div>

          {/* NOTIFICATIONS */}

          <div
            style={{
              maxHeight: "420px",
              overflowY: "auto",
            }}
          >
            {notifications.length ===
              0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#888",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    marginBottom: "10px",
                  }}
                >
                  🔔
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                  }}
                >
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <div
                    key={
                      notification._id
                    }
                    style={{
                      position:
                        "relative",
                      padding:
                        "14px 45px 14px 16px",
                      borderBottom:
                        "1px solid #f0f0f0",
                      background:
                        notification.isRead
                          ? "white"
                          : "#f0f9f7",
                      cursor:
                        notification
                          .property
                          ? "pointer"
                          : "default",
                    }}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >
                    {!notification.isRead && (
                      <span
                        style={{
                          position:
                            "absolute",
                          left: "7px",
                          top: "19px",
                          width: "7px",
                          height: "7px",
                          borderRadius:
                            "50%",
                          background:
                            "#14786b",
                        }}
                      />
                    )}

                    <h4
                      style={{
                        margin:
                          "0 0 5px",
                        fontSize:
                          "14px",
                        color:
                          "#222",
                        fontWeight:
                          notification.isRead
                            ? "600"
                            : "700",
                      }}
                    >
                      {notification.title}
                    </h4>

                    <p
                      style={{
                        margin:
                          "0 0 7px",
                        fontSize:
                          "13px",
                        lineHeight:
                          "1.45",
                        color:
                          "#555",
                      }}
                    >
                      {
                        notification.message
                      }
                    </p>

                    <span
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#999",
                      }}
                    >
                      {formatDate(
                        notification.createdAt
                      )}
                    </span>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        deleteNotification(
                          notification._id
                        );
                      }}
                      style={{
                        position:
                          "absolute",
                        top: "12px",
                        right: "10px",
                        border: "none",
                        background:
                          "transparent",
                        color: "#999",
                        cursor:
                          "pointer",
                        fontSize:
                          "16px",
                      }}
                      title="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;