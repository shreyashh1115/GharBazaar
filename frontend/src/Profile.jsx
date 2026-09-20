import { useEffect, useState } from "react";

function Profile({
  token,
  user,
  properties,
  favoritesCount,
  onBack,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onViewDetails,
  onProfileUpdated,
}) {
  const [myProperties, setMyProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===============================
  // EDIT PROFILE
  // ===============================

  const [showEditProfile, setShowEditProfile] =
    useState(false);

  const [profileForm, setProfileForm] =
    useState({
      name: "",
      email: "",
      phone: "",
    });

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [profileLoading, setProfileLoading] =
    useState(false);

  // ===============================
  // CHANGE PASSWORD
  // ===============================

  const [showChangePassword, setShowChangePassword] =
    useState(false);

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  // ===============================
  // FETCH MY PROPERTIES
  // ===============================

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://gharbazaar-hb8d.onrender.com/api/properties"
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load properties"
          );
          return;
        }

        const currentUserId =
          user?.id || user?._id;

        const ownedProperties =
          data.filter((property) => {
            if (!property.owner) {
              return false;
            }

            const ownerId =
              typeof property.owner ===
              "object"
                ? property.owner._id
                : property.owner;

            return (
              ownerId === currentUserId
            );
          });

        setMyProperties(
          ownedProperties
        );
      } catch (error) {
        console.log(error);

        setError(
          "Unable to connect to backend server"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      fetchMyProperties();
    }
  }, [token, user]);

  // ===============================
  // OPEN EDIT PROFILE
  // ===============================

  const handleOpenEditProfile = () => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setProfileMessage("");
    setProfileError("");

    setShowEditProfile(true);
    setShowChangePassword(false);
  };

  // ===============================
  // PROFILE INPUT
  // ===============================

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  // ===============================
  // UPDATE PROFILE
  // ===============================

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");
    setProfileLoading(true);

    try {
      const response = await fetch(
        "https://gharbazaar-hb8d.onrender.com/api/auth/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: profileForm.name,
            email: profileForm.email,
            phone: profileForm.phone,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setProfileError(
          data.message ||
            "Unable to update profile"
        );

        return;
      }

      setProfileMessage(
        "Profile updated successfully"
      );

      if (data.user) {
        localStorage.setItem(
          "gharbazaar_user",
          JSON.stringify(data.user)
        );

        if (onProfileUpdated) {
          onProfileUpdated(
            data.user
          );
        }
      }

      setTimeout(() => {
        setShowEditProfile(false);
      }, 1000);
    } catch (error) {
      console.log(
        "PROFILE UPDATE ERROR:",
        error
      );

      setProfileError(
        "Unable to connect to backend server"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // ===============================
  // OPEN CHANGE PASSWORD
  // ===============================

  const handleOpenChangePassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordMessage("");
    setPasswordError("");

    setShowChangePassword(true);
    setShowEditProfile(false);
  };

  // ===============================
  // PASSWORD INPUT
  // ===============================

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  // ===============================
  // CHANGE PASSWORD
  // ===============================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match"
      );

      return;
    }

    if (
      passwordForm.newPassword.length < 6
    ) {
      setPasswordError(
        "New password must be at least 6 characters"
      );

      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        "https://gharbazaar-hb8d.onrender.com/api/auth/change-password",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            currentPassword:
              passwordForm.currentPassword,

            newPassword:
              passwordForm.newPassword,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setPasswordError(
          data.message ||
            "Unable to change password"
        );

        return;
      }

      setPasswordMessage(
        "Password changed successfully"
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log(
        "CHANGE PASSWORD ERROR:",
        error
      );

      setPasswordError(
        "Unable to connect to backend server"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ===============================
  // DELETE PROPERTY
  // ===============================

  const handleDelete = async (
    propertyId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this property?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `https://gharbazaar-hb8d.onrender.com/api/properties/${propertyId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to delete property"
        );

        return;
      }

      setMyProperties(
        (current) =>
          current.filter(
            (property) =>
              property._id !== propertyId
          )
      );

      if (onDeleteProperty) {
        onDeleteProperty(
          propertyId
        );
      }

      alert(
        "Property deleted successfully"
      );
    } catch (error) {
      console.log(error);

      alert(
        "Unable to connect to backend server"
      );
    }
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f9f9",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >

        {/* BACK BUTTON */}

        <button
          onClick={onBack}
          style={{
            padding: "10px 18px",
            marginBottom: "25px",
            border:
              "1px solid #14786b",
            borderRadius: "7px",
            background: "white",
            color: "#14786b",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Back to Home
        </button>

        {/* PROFILE HEADER */}

        <div
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "30px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >

              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "#14786b",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  fontSize: "34px",
                  fontWeight: "700",
                }}
              >
                {user?.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>

              <div>

                <h1
                  style={{
                    margin: "0 0 10px",
                  }}
                >
                  {user?.name ||
                    "User"}
                </h1>

                <p
                  style={{
                    margin: "5px 0",
                    color: "#666",
                  }}
                >
                  📧{" "}
                  {user?.email ||
                    "Email not available"}
                </p>

                <p
                  style={{
                    margin: "5px 0",
                    color: "#666",
                  }}
                >
                  📞{" "}
                  {user?.phone
                    ? user.phone
                    : "Phone not available"}
                </p>

              </div>
            </div>

            {/* PROFILE BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >

              <button
                onClick={
                  handleOpenEditProfile
                }
                style={{
                  padding:
                    "11px 18px",
                  border:
                    "1px solid #14786b",
                  borderRadius: "7px",
                  background: "white",
                  color: "#14786b",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                ✏️ Edit Profile
              </button>

              <button
                onClick={
                  handleOpenChangePassword
                }
                style={{
                  padding:
                    "11px 18px",
                  border: "none",
                  borderRadius: "7px",
                  background:
                    "#14786b",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                🔐 Change Password
              </button>

            </div>

          </div>
        </div>

        {/* ===============================
            EDIT PROFILE FORM
        =============================== */}

        {showEditProfile && (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "30px",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.08)",
              marginBottom: "25px",
            }}
          >

            <h2
              style={{
                textAlign: "center",
                marginBottom: "25px",
              }}
            >
              ✏️ Edit Profile
            </h2>

            <form
              onSubmit={
                handleUpdateProfile
              }
            >

              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Name
              </label>

              <input
                type="text"
                name="name"
                value={
                  profileForm.name
                }
                onChange={
                  handleProfileChange
                }
                required
                style={{
                  width: "100%",
                  padding: "13px",
                  border:
                    "1px solid #ccc",
                  borderRadius: "7px",
                  fontSize: "16px",
                  marginBottom: "18px",
                  boxSizing:
                    "border-box",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  profileForm.email
                }
                onChange={
                  handleProfileChange
                }
                required
                style={{
                  width: "100%",
                  padding: "13px",
                  border:
                    "1px solid #ccc",
                  borderRadius: "7px",
                  fontSize: "16px",
                  marginBottom: "18px",
                  boxSizing:
                    "border-box",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={
                  profileForm.phone
                }
                onChange={
                  handleProfileChange
                }
                maxLength="10"
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: "13px",
                  border:
                    "1px solid #ccc",
                  borderRadius: "7px",
                  fontSize: "16px",
                  marginBottom: "20px",
                  boxSizing:
                    "border-box",
                }}
              />

              {profileMessage && (
                <p
                  style={{
                    color: "green",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {profileMessage}
                </p>
              )}

              {profileError && (
                <p
                  style={{
                    color: "red",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {profileError}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >

                <button
                  type="submit"
                  disabled={
                    profileLoading
                  }
                  style={{
                    padding:
                      "11px 20px",
                    border: "none",
                    borderRadius: "7px",
                    background:
                      "#14786b",
                    color: "white",
                    cursor:
                      "pointer",
                    fontWeight: "600",
                  }}
                >
                  {profileLoading
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowEditProfile(
                      false
                    )
                  }
                  style={{
                    padding:
                      "11px 20px",
                    border:
                      "1px solid #aaa",
                    borderRadius: "7px",
                    background:
                      "white",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        )}

        {/* ===============================
            CHANGE PASSWORD FORM
        =============================== */}

        {showChangePassword && (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "30px",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.08)",
              marginBottom: "25px",
            }}
          >

            <h2
              style={{
                textAlign: "center",
                marginBottom: "25px",
              }}
            >
              🔐 Change Password
            </h2>

            <form
              onSubmit={
                handleChangePassword
              }
            >

              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                value={
                  passwordForm.currentPassword
                }
                onChange={
                  handlePasswordChange
                }
                required
                style={{
                  width: "100%",
                  padding: "13px",
                  border:
                    "1px solid #ccc",
                  borderRadius: "7px",
                  fontSize: "16px",
                  marginBottom: "18px",
                  boxSizing:
                    "border-box",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                value={
                  passwordForm.newPassword
                }
                onChange={
                  handlePasswordChange
                }
                required
                minLength="6"
                style={{
                  width: "100%",
                  padding: "13px",
                  border:
                    "1px solid #ccc",
                  borderRadius: "7px",
                  fontSize: "16px",
                  marginBottom: "18px",
                  boxSizing:
                    "border-box",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  passwordForm.confirmPassword
                }
                onChange={
                  handlePasswordChange
                }
                required
                minLength="6"
                style={{
                  width: "100%",
                  padding: "13px",
                  border:
                    "1px solid #ccc",
                  borderRadius: "7px",
                  fontSize: "16px",
                  marginBottom: "20px",
                  boxSizing:
                    "border-box",
                }}
              />

              {passwordMessage && (
                <p
                  style={{
                    color: "green",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {passwordMessage}
                </p>
              )}

              {passwordError && (
                <p
                  style={{
                    color: "red",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {passwordError}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >

                <button
                  type="submit"
                  disabled={
                    passwordLoading
                  }
                  style={{
                    padding:
                      "11px 20px",
                    border: "none",
                    borderRadius: "7px",
                    background:
                      "#14786b",
                    color: "white",
                    cursor:
                      "pointer",
                    fontWeight: "600",
                  }}
                >
                  {passwordLoading
                    ? "Changing..."
                    : "Change Password"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowChangePassword(
                      false
                    )
                  }
                  style={{
                    padding:
                      "11px 20px",
                    border:
                      "1px solid #aaa",
                    borderRadius:
                      "7px",
                    background:
                      "white",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        )}

        {/* ===============================
            STATISTICS
        =============================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >

          {/* MY PROPERTIES STAT */}

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "32px",
              }}
            >
              🏠
            </div>

            <h2
              style={{
                margin: "8px 0",
                color: "#14786b",
              }}
            >
              {myProperties.length}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#666",
              }}
            >
              My Properties
            </p>
          </div>

          {/* FAVORITES STAT */}

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "32px",
              }}
            >
              ❤️
            </div>

            <h2
              style={{
                margin: "8px 0",
                color: "#14786b",
              }}
            >
              {favoritesCount || 0}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#666",
              }}
            >
              Favorites
            </p>
          </div>

        </div>

        {/* ===============================
            MY PROPERTIES
        =============================== */}

        <div
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "25px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "25px",
            }}
          >

            <div>

              <h2
                style={{
                  margin: 0,
                }}
              >
                🏠 My Properties
              </h2>

              <p
                style={{
                  color: "#666",
                  marginBottom: 0,
                }}
              >
                Properties listed by you
              </p>

            </div>

            <button
              onClick={
                onAddProperty
              }
              style={{
                padding:
                  "11px 18px",
                border: "none",
                borderRadius: "7px",
                background:
                  "#14786b",
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              + Add Property
            </button>

          </div>

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
              }}
            >
              Loading your properties...
            </div>
          )}

          {!loading &&
            error && (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "red",
                }}
              >
                {error}
              </div>
            )}

          {!loading &&
            !error &&
            myProperties.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 20px",
                  border:
                    "1px solid #eee",
                  borderRadius: "10px",
                }}
              >

                <div
                  style={{
                    fontSize: "50px",
                  }}
                >
                  🏠
                </div>

                <h3>
                  No Properties Yet
                </h3>

                <p
                  style={{
                    color: "#666",
                  }}
                >
                  You haven't listed any
                  properties yet.
                </p>

                <button
                  onClick={
                    onAddProperty
                  }
                  style={{
                    padding:
                      "11px 18px",
                    border: "none",
                    borderRadius: "7px",
                    background:
                      "#14786b",
                    color: "white",
                    cursor:
                      "pointer",
                    fontWeight:
                      "600",
                  }}
                >
                  Add Your First Property
                </button>

              </div>
            )}

          {!loading &&
            !error &&
            myProperties.length > 0 && (

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "22px",
                }}
              >

                {myProperties.map(
                  (property) => (

                    <div
                      key={
                        property._id
                      }
                      style={{
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "12px",
                        overflow:
                          "hidden",
                        background:
                          "white",
                      }}
                    >

                      <div
                        style={{
                          height: "190px",
                          background:
                            "#f1f1f1",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >

                        {property.images &&
                        property.images
                          .length > 0 ? (

                          <img
                            src={
                              property.images[0]
                            }
                            alt={
                              property.title
                            }
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                            }}
                          />

                        ) : (

                          <span
                            style={{
                              fontSize:
                                "50px",
                            }}
                          >
                            🏠
                          </span>

                        )}

                      </div>

                      <div
                        style={{
                          padding:
                            "18px",
                        }}
                      >

                        <span
                          style={{
                            display:
                              "inline-block",
                            padding:
                              "5px 9px",
                            borderRadius:
                              "5px",
                            background:
                              "#e8f5f2",
                            color:
                              "#14786b",
                            fontSize:
                              "13px",
                            fontWeight:
                              "600",
                          }}
                        >
                          {property.listingType ===
                          "Rent"
                            ? "For Rent"
                            : "For Sale"}
                        </span>

                        <h3
                          style={{
                            margin:
                              "12px 0 8px",
                          }}
                        >
                          {property.title}
                        </h3>

                        <p
                          style={{
                            color:
                              "#666",
                          }}
                        >
                          📍{" "}
                          {property.location}
                        </p>

                        <h3
                          style={{
                            color:
                              "#14786b",
                          }}
                        >
                          ₹
                          {Number(
                            property.price
                          ).toLocaleString(
                            "en-IN"
                          )}

                          {property.listingType ===
                          "Rent"
                            ? " / month"
                            : ""}
                        </h3>

                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "12px",
                            color:
                              "#666",
                            fontSize:
                              "14px",
                          }}
                        >

                          <span>
                            🛏️{" "}
                            {
                              property.bedrooms
                            }
                          </span>

                          <span>
                            🛁{" "}
                            {
                              property.bathrooms
                            }
                          </span>

                          <span>
                            📐{" "}
                            {
                              property.area
                            }{" "}
                            sq.ft
                          </span>

                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            gap: "8px",
                            flexWrap:
                              "wrap",
                            marginTop:
                              "18px",
                          }}
                        >

                          <button
                            onClick={() =>
                              onViewDetails(
                                property._id
                              )
                            }
                            style={{
                              flex: 1,
                              minWidth:
                                "100px",
                              padding:
                                "9px",
                              border:
                                "none",
                              borderRadius:
                                "6px",
                              background:
                                "#14786b",
                              color:
                                "white",
                              cursor:
                                "pointer",
                              fontWeight:
                                "600",
                            }}
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              onEditProperty(
                                property
                              )
                            }
                            style={{
                              padding:
                                "9px 13px",
                              border:
                                "1px solid #14786b",
                              borderRadius:
                                "6px",
                              background:
                                "white",
                              color:
                                "#14786b",
                              cursor:
                                "pointer",
                              fontWeight:
                                "600",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                property._id
                              )
                            }
                            style={{
                              padding:
                                "9px 13px",
                              border:
                                "1px solid #d9534f",
                              borderRadius:
                                "6px",
                              background:
                                "white",
                              color:
                                "#d9534f",
                              cursor:
                                "pointer",
                              fontWeight:
                                "600",
                            }}
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

        </div>

      </div>
    </div>
  );
}

export default Profile;