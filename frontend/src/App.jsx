import { useEffect, useState } from "react";

import Login from "./Login";
import Register from "./Register";
import AddProperty from "./AddProperty";
import PropertyDetails from "./PropertyDetails";
import Favorites from "./Favorites";
import Profile from "./Profile";
import Enquiries from "./Enquiries";

import "./App.css";

// ========================================
// API URL
// ========================================

const API_URL = "https://gharbazaar-hb8d.onrender.com/api";

// ========================================
// APP
// ========================================

function App() {

  // ======================================
  // PAGE
  // ======================================

  const [page, setPage] = useState(() => {
    const path = window.location.pathname;

    if (path.startsWith("/property/")) {
      return "property-details";
    }

    if (path === "/enquiries") {
      return "enquiries";
    }

    return "home";
  });

  // ======================================
  // PROPERTIES
  // ======================================

  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ======================================
  // SELECTED PROPERTY
  // ======================================

  const [
    selectedPropertyId,
    setSelectedPropertyId,
  ] = useState(() => {

    const path = window.location.pathname;

    if (path.startsWith("/property/")) {
      return path.split("/property/")[1];
    }

    return null;
  });

  // ======================================
  // SELECTED ENQUIRY
  // ======================================

  const [
    selectedEnquiryId,
    setSelectedEnquiryId,
  ] = useState(null);

  // ======================================
  // EDIT PROPERTY
  // ======================================

  const [
    editingProperty,
    setEditingProperty,
  ] = useState(null);

  const [
    uploadingEditImages,
    setUploadingEditImages,
  ] = useState(false);

  // ======================================
  // AUTH
  // ======================================

  const [token, setToken] = useState(
    localStorage.getItem("gharbazaar_token")
  );

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem("gharbazaar_user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  // ======================================
  // FAVORITES
  // ======================================

  const [
    favorites,
    setFavorites,
  ] = useState([]);

  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);

  // ======================================
  // SEARCH
  // ======================================

  const [
    searchType,
    setSearchType,
  ] = useState("Buy");

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    searchLocation,
    setSearchLocation,
  ] = useState("");

  // ======================================
  // FILTERS
  // ======================================

  const [
    propertyTypeFilter,
    setPropertyTypeFilter,
  ] = useState("All");

  const [
    minPrice,
    setMinPrice,
  ] = useState("");

  const [
    maxPrice,
    setMaxPrice,
  ] = useState("");

  // ======================================
  // NOTIFICATIONS
  // ======================================

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadNotifications,
    setUnreadNotifications,
  ] = useState(0);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    notificationLoading,
    setNotificationLoading,
  ] = useState(false);

  // ======================================
  // GET AUTH HEADERS
  // ======================================

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",

      Authorization:
        `Bearer ${token}`,
    };
  };

  // ======================================
  // PROPERTY URL
  // ======================================

  const openPropertyDetails = (
    propertyId
  ) => {

    setSelectedPropertyId(propertyId);

    setSelectedEnquiryId(null);

    setPage("property-details");

    window.history.pushState(
      {},
      "",
      `/property/${propertyId}`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================
  // ENQUIRIES NAVIGATION
  // ======================================

  const openEnquiries = (
    enquiryId = null
  ) => {

    setSelectedPropertyId(null);

    setSelectedEnquiryId(
      enquiryId
    );

    setPage("enquiries");

    window.history.pushState(
      {},
      "",
      "/enquiries"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================
  // HOME NAVIGATION
  // ======================================

  const handleHome = () => {

    setSelectedPropertyId(null);

    setSelectedEnquiryId(null);

    setEditingProperty(null);

    setSearchType("Buy");

    setSearchInput("");

    setSearchLocation("");

    setPropertyTypeFilter("All");

    setMinPrice("");

    setMaxPrice("");

    setPage("home");

    window.history.pushState(
      {},
      "",
      "/"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================
  // BROWSER BACK / FORWARD
  // ======================================

  useEffect(() => {

    const handlePopState = () => {

      const path =
        window.location.pathname;

      if (
        path.startsWith("/property/")
      ) {

        const propertyId =
          path.split(
            "/property/"
          )[1];

        setSelectedPropertyId(
          propertyId
        );

        setSelectedEnquiryId(null);

        setPage(
          "property-details"
        );

        return;
      }

      if (path === "/enquiries") {

        setSelectedPropertyId(null);

        setPage("enquiries");

        return;
      }

      setSelectedPropertyId(null);

      setSelectedEnquiryId(null);

      setPage("home");
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {

      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };

  }, []);

  // ======================================
  // FETCH PROPERTIES
  // ======================================

  const fetchProperties = async () => {

    try {

      setLoading(true);

      setError("");

      const response =
        await fetch(
          `${API_URL}/properties`
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.message ||
          "Unable to load properties"
        );

        return;
      }

      setProperties(data);

    } catch (error) {

      console.log(error);

      setError(
        "Unable to connect to backend server"
      );

    } finally {

      setLoading(false);
    }
  };

  // ======================================
  // FETCH FAVORITES
  // ======================================

  const fetchFavorites = async (
    currentToken = token
  ) => {

    if (!currentToken) {

      setFavorites([]);

      return;
    }

    try {

      const response =
        await fetch(
          `${API_URL}/favorites`,
          {
            headers: {
              Authorization:
                `Bearer ${currentToken}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        console.log(
          data.message ||
          "Unable to load favorites"
        );

        return;
      }

      setFavorites(data);

    } catch (error) {

      console.log(
        "FETCH FAVORITES ERROR:"
      );

      console.log(error);
    }
  };

  // ======================================
  // FETCH NOTIFICATIONS
  // ======================================

  const fetchNotifications = async (
    currentToken = token
  ) => {

    if (!currentToken) {

      setNotifications([]);

      setUnreadNotifications(0);

      return;
    }

    try {

      setNotificationLoading(true);

      const response =
        await fetch(
          `${API_URL}/notifications`,
          {
            headers: {
              Authorization:
                `Bearer ${currentToken}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        console.log(
          data.message ||
          "Unable to load notifications"
        );

        return;
      }

      const notificationList =
        Array.isArray(data)
          ? data
          : [];

      setNotifications(
        notificationList
      );

      setUnreadNotifications(
        notificationList.filter(
          (item) =>
            !item.isRead
        ).length
      );

    } catch (error) {

      console.log(
        "FETCH NOTIFICATIONS ERROR:"
      );

      console.log(error);

    } finally {

      setNotificationLoading(
        false
      );
    }
  };

  // ======================================
  // FETCH UNREAD COUNT
  // ======================================

  const fetchUnreadNotificationCount =
    async (
      currentToken = token
    ) => {

      if (!currentToken) {

        setUnreadNotifications(0);

        return;
      }

      try {

        const response =
          await fetch(
            `${API_URL}/notifications/unread-count`,
            {
              headers: {
                Authorization:
                  `Bearer ${currentToken}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          return;
        }

        setUnreadNotifications(
          Number(
            data.count || 0
          )
        );

      } catch (error) {

        console.log(
          "FETCH UNREAD COUNT ERROR:"
        );

        console.log(error);
      }
    };

  // ======================================
  // NOTIFICATION CLICK
  // ======================================

  const handleNotificationClick =
    async (notification) => {

      if (!token) {
        return;
      }

      try {

        if (!notification.isRead) {

          const response =
            await fetch(
              `${API_URL}/notifications/${notification._id}/read`,
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
              (current) =>
                current.map(
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

            setUnreadNotifications(
              (current) =>
                Math.max(
                  0,
                  current - 1
                )
            );
          }
        }

      } catch (error) {

        console.log(
          "MARK NOTIFICATION ERROR:"
        );

        console.log(error);
      }

      setShowNotifications(false);

      // ==================================
      // ENQUIRY NOTIFICATION
      // ==================================

      if (
        notification.type ===
          "EnquiryReply" ||
        notification.type ===
          "EnquiryStatus" ||
        notification.type ===
          "Enquiry"
      ) {

        openEnquiries(
          notification.enquiry?._id ||
          null
        );

        return;
      }

      // ==================================
      // PROPERTY NOTIFICATION
      // ==================================

      if (
        notification.property?._id
      ) {

        openPropertyDetails(
          notification.property._id
        );
      }
    };

  // ======================================
  // MARK ALL NOTIFICATIONS READ
  // ======================================

  const handleMarkAllNotificationsRead =
    async () => {

      if (
        !token ||
        unreadNotifications === 0
      ) {
        return;
      }

      try {

        const response =
          await fetch(
            `${API_URL}/notifications/read-all`,
            {
              method: "PUT",

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
            "Unable to mark notifications as read"
          );

          return;
        }

        setNotifications(
          (current) =>
            current.map(
              (item) => ({
                ...item,
                isRead: true,
              })
            )
        );

        setUnreadNotifications(0);

      } catch (error) {

        console.log(
          "MARK ALL NOTIFICATIONS ERROR:"
        );

        console.log(error);
      }
    };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    fetchProperties();

  }, []);

  // ======================================
  // FAVORITES WHEN LOGIN CHANGES
  // ======================================

  useEffect(() => {

    if (token) {

      fetchFavorites(token);

    } else {

      setFavorites([]);
    }

  }, [token]);

  // ======================================
  // NOTIFICATIONS WHEN LOGIN CHANGES
  // ======================================

  useEffect(() => {

    if (token) {

      fetchNotifications(token);

    } else {

      setNotifications([]);

      setUnreadNotifications(0);

      setShowNotifications(false);
    }

  }, [token]);

  // ======================================
  // REFRESH UNREAD COUNT
  // ======================================

  useEffect(() => {

    if (!token) {
      return;
    }

    const interval =
      setInterval(() => {

        fetchUnreadNotificationCount(
          token
        );

      }, 30000);

    return () => {

      clearInterval(interval);
    };

  }, [token]);

  // ======================================
  // LOGIN SUCCESS
  // ======================================

  const handleLoginSuccess = (
    data
  ) => {

    localStorage.setItem(
      "gharbazaar_token",
      data.token
    );

    localStorage.setItem(
      "gharbazaar_user",
      JSON.stringify(
        data.user
      )
    );

    setToken(data.token);

    setUser(data.user);

    setSelectedPropertyId(null);

    setSelectedEnquiryId(null);

    setEditingProperty(null);

    setSearchType("Buy");

    setSearchInput("");

    setSearchLocation("");

    setPropertyTypeFilter("All");

    setMinPrice("");

    setMaxPrice("");

    setNotifications([]);

    setUnreadNotifications(0);

    setShowNotifications(false);

    setPage("home");

    window.history.pushState(
      {},
      "",
      "/"
    );

    fetchFavorites(
      data.token
    );

    fetchNotifications(
      data.token
    );
  };

  // ======================================
  // PROFILE UPDATED
  // ======================================

  const handleProfileUpdated = (
    updatedUser
  ) => {

    setUser(updatedUser);

    localStorage.setItem(
      "gharbazaar_user",
      JSON.stringify(
        updatedUser
      )
    );
  };

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = () => {

    localStorage.removeItem(
      "gharbazaar_token"
    );

    localStorage.removeItem(
      "gharbazaar_user"
    );

    setToken(null);

    setUser(null);

    setFavorites([]);

    setNotifications([]);

    setUnreadNotifications(0);

    setShowNotifications(false);

    setSelectedPropertyId(null);

    setSelectedEnquiryId(null);

    setEditingProperty(null);

    setSearchType("Buy");

    setSearchInput("");

    setSearchLocation("");

    setPropertyTypeFilter("All");

    setMinPrice("");

    setMaxPrice("");

    setPage("home");

    window.history.pushState(
      {},
      "",
      "/"
    );
  };

  // ======================================
  // CHECK PROPERTY OWNER
  // ======================================

  const isPropertyOwner = (
    property
  ) => {

    if (!user || !property) {
      return false;
    }

    if (!property.owner) {
      return false;
    }

    const ownerId =
      typeof property.owner ===
      "object"
        ? property.owner._id
        : property.owner;

    return (
      ownerId === user.id ||
      ownerId === user._id
    );
  };

  // ======================================
  // CHECK FAVORITE
  // ======================================

  const isFavorite = (
    propertyId
  ) => {

    return favorites.some(
      (property) =>
        property._id ===
        propertyId
    );
  };

  // ======================================
  // ADD / REMOVE FAVORITE
  // ======================================

  const handleFavorite = async (
    event,
    propertyId
  ) => {

    event.stopPropagation();

    if (!token) {

      alert(
        "Please login to add favorites"
      );

      setPage("login");

      return;
    }

    if (favoriteLoading) {
      return;
    }

    try {

      setFavoriteLoading(true);

      const alreadyFavorite =
        isFavorite(
          propertyId
        );

      const response =
        await fetch(
          `${API_URL}/favorites/${propertyId}`,
          {
            method:
              alreadyFavorite
                ? "DELETE"
                : "POST",

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
          "Unable to update favorite"
        );

        return;
      }

      if (!alreadyFavorite) {

        const property =
          properties.find(
            (item) =>
              item._id ===
              propertyId
          );

        if (property) {

          setFavorites(
            (
              currentFavorites
            ) => [
              ...currentFavorites,
              property,
            ]
          );
        }

      } else {

        setFavorites(
          (
            currentFavorites
          ) =>
            currentFavorites.filter(
              (property) =>
                property._id !==
                propertyId
            )
        );
      }

    } catch (error) {

      console.log(
        "FAVORITE ERROR:"
      );

      console.log(error);

      alert(
        "Unable to connect to backend server"
      );

    } finally {

      setFavoriteLoading(false);
    }
  };

  // ======================================
  // DELETE PROPERTY
  // ======================================

  const handleDelete = async (
    propertyId
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this property?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const response =
        await fetch(
          `${API_URL}/properties/${propertyId}`,
          {
            method: "DELETE",

            headers:
              getAuthHeaders(),
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

      setProperties(
        (
          currentProperties
        ) =>
          currentProperties.filter(
            (property) =>
              property._id !==
              propertyId
          )
      );

      setFavorites(
        (
          currentFavorites
        ) =>
          currentFavorites.filter(
            (property) =>
              property._id !==
              propertyId
          )
      );

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

  // ======================================
  // EDIT PROPERTY
  // ======================================

  const handleEdit = (
    property
  ) => {

    setEditingProperty({
      ...property,

      images: Array.isArray(
        property.images
      )
        ? [
            ...property.images,
          ]
        : [],
    });

    setPage(
      "edit-property"
    );
  };

  // ======================================
  // EDIT INPUT CHANGE
  // ======================================

  const handleEditChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;

    setEditingProperty(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  // ======================================
  // REMOVE EDIT IMAGE
  // ======================================

  const handleRemoveEditImage = (
    imageIndex
  ) => {

    setEditingProperty(
      (current) => ({
        ...current,

        images: (
          current.images || []
        ).filter(
          (_, index) =>
            index !==
            imageIndex
        ),
      })
    );
  };

  // ======================================
  // UPLOAD NEW EDIT IMAGES
  // ======================================

  const handleEditImageUpload =
    async (event) => {

      const files =
        Array.from(
          event.target.files || []
        );

      if (files.length === 0) {
        return;
      }

      if (!token) {

        alert(
          "Please login again."
        );

        return;
      }

      try {

        setUploadingEditImages(
          true
        );

        const uploadedImages = [];

        for (
          const file of files
        ) {

          const formData =
            new FormData();

          formData.append(
            "image",
            file
          );

          const response =
            await fetch(
              `${API_URL}/upload/single`,
              {
                method: "POST",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },

                body: formData,
              }
            );

          const data =
            await response.json();

          if (!response.ok) {

            alert(
              data.message ||
              `Unable to upload ${file.name}`
            );

            continue;
          }

          if (data.imageUrl) {

            uploadedImages.push(
              data.imageUrl
            );
          }
        }

        if (
          uploadedImages.length >
          0
        ) {

          setEditingProperty(
            (current) => ({
              ...current,

              images: [
                ...(current.images ||
                  []),
                ...uploadedImages,
              ],
            })
          );
        }

        event.target.value = "";

      } catch (error) {

        console.log(
          "EDIT IMAGE UPLOAD ERROR:"
        );

        console.log(error);

        alert(
          "Unable to upload image"
        );

      } finally {

        setUploadingEditImages(
          false
        );
      }
    };

  // ======================================
  // UPDATE PROPERTY
  // ======================================

  const handleUpdateProperty =
    async (event) => {

      event.preventDefault();

      if (!editingProperty) {
        return;
      }

      try {

        const response =
          await fetch(
            `${API_URL}/properties/${editingProperty._id}`,
            {
              method: "PUT",

              headers:
                getAuthHeaders(),

              body: JSON.stringify({
                title:
                  editingProperty.title,

                description:
                  editingProperty.description,

                price: Number(
                  editingProperty.price
                ),

                area: Number(
                  editingProperty.area
                ),

                bedrooms: Number(
                  editingProperty.bedrooms
                ),

                bathrooms: Number(
                  editingProperty.bathrooms
                ),

                yearBuilt:
                  editingProperty.yearBuilt
                    ? Number(
                        editingProperty.yearBuilt
                      )
                    : undefined,

                location:
                  editingProperty.location,

                propertyType:
                  editingProperty.propertyType,

                listingType:
                  editingProperty.listingType,

                furnished:
                  editingProperty.furnished,

                status:
                  editingProperty.status,

                images:
                  editingProperty.images ||
                  [],
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          alert(
            data.message ||
            "Unable to update property"
          );

          return;
        }

        setProperties(
          (
            currentProperties
          ) =>
            currentProperties.map(
              (property) =>
                property._id ===
                editingProperty._id
                  ? {
                      ...property,
                      ...data.property,
                    }
                  : property
            )
        );

        setEditingProperty(null);

        alert(
          "Property updated successfully"
        );

        handleHome();

      } catch (error) {

        console.log(error);

        alert(
          "Unable to connect to backend server"
        );
      }
    };

  // ======================================
  // SEARCH
  // ======================================

  const handleSearch = () => {

    setPage("home");

    window.history.pushState(
      {},
      "",
      "/"
    );
  };

  // ======================================
  // CLEAR SEARCH
  // ======================================

  const clearSearch = () => {

    setSearchInput("");

    setSearchLocation("");

    setPropertyTypeFilter(
      "All"
    );

    setMinPrice("");

    setMaxPrice("");

    setSearchType("Buy");
  };

  // ======================================
  // FILTER PROPERTIES
  // ======================================

  const filteredProperties =
    properties.filter(
      (property) => {

        // BUY / RENT

        if (
          searchType === "Rent" &&
          property.listingType !==
            "Rent"
        ) {
          return false;
        }

        if (
          searchType === "Buy" &&
          property.listingType !==
            "Sale"
        ) {
          return false;
        }

        // PROPERTY TYPE

        if (
          propertyTypeFilter !==
            "All" &&
          property.propertyType !==
            propertyTypeFilter
        ) {
          return false;
        }

        // LOCATION

        if (
          searchLocation.trim() !==
          ""
        ) {

          const location =
            property.location
              ?.toLowerCase() ||
            "";

          if (
            !location.includes(
              searchLocation
                .toLowerCase()
                .trim()
            )
          ) {
            return false;
          }
        }

        // SEARCH TEXT

        if (
          searchInput.trim() !==
          ""
        ) {

          const search =
            searchInput
              .toLowerCase()
              .trim();

          const title =
            property.title
              ?.toLowerCase() ||
            "";

          const description =
            property.description
              ?.toLowerCase() ||
            "";

          const location =
            property.location
              ?.toLowerCase() ||
            "";

          if (
            !title.includes(
              search
            ) &&
            !description.includes(
              search
            ) &&
            !location.includes(
              search
            )
          ) {
            return false;
          }
        }

        // MIN PRICE

        if (
          minPrice !== "" &&
          Number(
            property.price
          ) <
            Number(
              minPrice
            )
        ) {
          return false;
        }

        // MAX PRICE

        if (
          maxPrice !== "" &&
          Number(
            property.price
          ) >
            Number(
              maxPrice
            )
        ) {
          return false;
        }

        return true;
      }
    );

  // ======================================
  // LOGIN PAGE
  // ======================================

  if (page === "login") {

    return (
      <Login
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    );
  }

  // ======================================
  // REGISTER PAGE
  // ======================================

  if (page === "register") {

    return <Register />;
  }

  // ======================================
  // ADD PROPERTY
  // ======================================

  if (
    page === "add-property"
  ) {

    if (!token) {

      return (
        <Login
          onLoginSuccess={
            handleLoginSuccess
          }
        />
      );
    }

    return (
      <AddProperty
        token={token}
        onBack={handleHome}
        onPropertyAdded={() => {
          fetchProperties();
          handleHome();
        }}
      />
    );
  }

  // ======================================
  // EDIT PROPERTY
  // ======================================

  if (
    page === "edit-property"
  ) {

    if (!token) {

      return (
        <Login
          onLoginSuccess={
            handleLoginSuccess
          }
        />
      );
    }

    if (!editingProperty) {

      return (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          <p>
            Loading edit property...
          </p>
        </div>
      );
    }

    return (
      <div
        style={{
          padding: "30px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >

        <button
          type="button"
          onClick={() => {

            setEditingProperty(null);

            handleHome();
          }}
          style={{
            padding: "10px 18px",
            marginBottom: "25px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <h1>
          Edit Property
        </h1>

        <form
          onSubmit={
            handleUpdateProperty
          }
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "25px",
          }}
        >

          <label>
            Title
          </label>

          <input
            name="title"
            value={
              editingProperty.title ||
              ""
            }
            onChange={
              handleEditChange
            }
            required
          />

          <label>
            Description
          </label>

          <textarea
            name="description"
            value={
              editingProperty.description ||
              ""
            }
            onChange={
              handleEditChange
            }
            rows="5"
          />

          <label>
            Price
          </label>

          <input
            name="price"
            type="number"
            value={
              editingProperty.price ||
              ""
            }
            onChange={
              handleEditChange
            }
            required
          />

          <label>
            Area (sq.ft)
          </label>

          <input
            name="area"
            type="number"
            value={
              editingProperty.area ||
              ""
            }
            onChange={
              handleEditChange
            }
            required
          />

          <label>
            Bedrooms
          </label>

          <input
            name="bedrooms"
            type="number"
            value={
              editingProperty.bedrooms ||
              ""
            }
            onChange={
              handleEditChange
            }
            required
          />

          <label>
            Bathrooms
          </label>

          <input
            name="bathrooms"
            type="number"
            value={
              editingProperty.bathrooms ||
              ""
            }
            onChange={
              handleEditChange
            }
            required
          />

          <label>
            Year Built
          </label>

          <input
            name="yearBuilt"
            type="number"
            value={
              editingProperty.yearBuilt ||
              ""
            }
            onChange={
              handleEditChange
            }
          />

          <label>
            Location
          </label>

          <input
            name="location"
            value={
              editingProperty.location ||
              ""
            }
            onChange={
              handleEditChange
            }
            required
          />

          <label>
            Property Type
          </label>

          <select
            name="propertyType"
            value={
              editingProperty.propertyType ||
              "House"
            }
            onChange={
              handleEditChange
            }
          >
            <option value="House">
              House
            </option>

            <option value="Flat">
              Flat
            </option>

            <option value="Villa">
              Villa
            </option>

            <option value="Plot">
              Plot
            </option>
          </select>

          <label>
            Listing Type
          </label>

          <select
            name="listingType"
            value={
              editingProperty.listingType ||
              "Sale"
            }
            onChange={
              handleEditChange
            }
          >
            <option value="Sale">
              Sale
            </option>

            <option value="Rent">
              Rent
            </option>
          </select>

          <label>
            Furnished
          </label>

          <select
            name="furnished"
            value={
              editingProperty.furnished ||
              "Unfurnished"
            }
            onChange={
              handleEditChange
            }
          >
            <option value="Furnished">
              Furnished
            </option>

            <option value="Semi-Furnished">
              Semi-Furnished
            </option>

            <option value="Unfurnished">
              Unfurnished
            </option>
          </select>

          <label>
            Status
          </label>

          <select
            name="status"
            value={
              editingProperty.status ||
              "Available"
            }
            onChange={
              handleEditChange
            }
          >
            <option value="Available">
              Available
            </option>

            <option value="Sold">
              Sold
            </option>
          </select>

          {/* PHOTOS */}

          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              background: "#fafafa",
            }}
          >

            <h3
              style={{
                marginTop: 0,
                marginBottom: "15px",
              }}
            >
              🖼️ Property Photos
            </h3>

            {editingProperty.images &&
            editingProperty.images.length >
              0 ? (

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >

                {editingProperty.images.map(
                  (
                    image,
                    index
                  ) => (

                    <div
                      key={`${image}-${index}`}
                      style={{
                        position:
                          "relative",
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "10px",
                        overflow:
                          "hidden",
                        background:
                          "white",
                      }}
                    >

                      <img
                        src={image}
                        alt={`Property ${
                          index + 1
                        }`}
                        style={{
                          width: "100%",
                          height: "130px",
                          objectFit:
                            "cover",
                          display:
                            "block",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveEditImage(
                            index
                          )
                        }
                        style={{
                          position:
                            "absolute",
                          top: "7px",
                          right: "7px",
                          width: "32px",
                          height: "32px",
                          border: "none",
                          borderRadius:
                            "50%",
                          background:
                            "#d9534f",
                          color: "white",
                          cursor:
                            "pointer",
                          fontSize:
                            "16px",
                          fontWeight:
                            "700",
                        }}
                      >
                        ×
                      </button>

                      <div
                        style={{
                          padding: "8px",
                          fontSize: "13px",
                          textAlign:
                            "center",
                          color: "#555",
                        }}
                      >
                        Photo{" "}
                        {index + 1}
                      </div>

                    </div>
                  )
                )}

              </div>

            ) : (

              <p
                style={{
                  color: "#777",
                  marginBottom:
                    "15px",
                }}
              >
                No photos available.
              </p>
            )}

            <label
              style={{
                display:
                  "inline-block",
                padding:
                  "11px 18px",
                background:
                  "#14786b",
                color: "white",
                borderRadius:
                  "7px",
                cursor:
                  uploadingEditImages
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  "600",
                opacity:
                  uploadingEditImages
                    ? 0.7
                    : 1,
              }}
            >

              {uploadingEditImages
                ? "Uploading..."
                : "➕ Add More Photos"}

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={
                  handleEditImageUpload
                }
                disabled={
                  uploadingEditImages
                }
                style={{
                  display:
                    "none",
                }}
              />

            </label>

            <p
              style={{
                fontSize: "13px",
                color: "#777",
                marginTop: "10px",
                marginBottom: 0,
              }}
            >
              JPG, JPEG, PNG किंवा WEBP
              images. Maximum 5MB per
              image.
            </p>

          </div>

          <button
            type="submit"
            disabled={
              uploadingEditImages
            }
            style={{
              marginTop: "15px",
              padding: "13px",
              background:
                uploadingEditImages
                  ? "#999"
                  : "#14786b",
              color: "white",
              border: "none",
              borderRadius: "7px",
              cursor:
                uploadingEditImages
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            {uploadingEditImages
              ? "Please wait..."
              : "💾 Update Property"}
          </button>

        </form>

      </div>
    );
  }

  // ======================================
  // ENQUIRIES PAGE
  // ======================================

  if (
    page === "enquiries"
  ) {

    if (!token || !user) {

      return (
        <Login
          onLoginSuccess={
            handleLoginSuccess
          }
        />
      );
    }

    return (
      <Enquiries
        token={token}
        user={user}
        initialEnquiryId={
          selectedEnquiryId
        }
        onBack={handleHome}
        onViewProperty={(
          propertyId
        ) => {

          openPropertyDetails(
            propertyId
          );
        }}
      />
    );
  }

  // ======================================
  // PROPERTY DETAILS
  // ======================================

  if (
    page === "property-details"
  ) {

    return (
      <PropertyDetails
        propertyId={
          selectedPropertyId
        }

        onBack={
          handleHome
        }

        onViewDetails={(
          propertyId
        ) => {

          openPropertyDetails(
            propertyId
          );
        }}
      />
    );
  }

  // ======================================
  // FAVORITES
  // ======================================

  if (
    page === "favorites"
  ) {

    if (!token) {

      return (
        <Login
          onLoginSuccess={
            handleLoginSuccess
          }
        />
      );
    }

    return (
      <Favorites
        token={token}
        onBack={handleHome}
        onViewDetails={(
          propertyId
        ) => {

          openPropertyDetails(
            propertyId
          );
        }}
      />
    );
  }

  // ======================================
  // PROFILE
  // ======================================

  if (
    page === "profile"
  ) {

    if (!token || !user) {

      return (
        <Login
          onLoginSuccess={
            handleLoginSuccess
          }
        />
      );
    }

    return (
      <Profile
        token={token}
        user={user}
        properties={
          properties
        }
        favoritesCount={
          favorites.length
        }
        onBack={handleHome}

        onAddProperty={() =>
          setPage(
            "add-property"
          )
        }

        onEditProperty={
          handleEdit
        }

        onDeleteProperty={(
          propertyId
        ) => {

          setProperties(
            (
              currentProperties
            ) =>
              currentProperties.filter(
                (property) =>
                  property._id !==
                  propertyId
              )
          );

          setFavorites(
            (
              currentFavorites
            ) =>
              currentFavorites.filter(
                (property) =>
                  property._id !==
                  propertyId
              )
          );
        }}

        onViewDetails={(
          propertyId
        ) => {

          openPropertyDetails(
            propertyId
          );
        }}

        onProfileUpdated={
          handleProfileUpdated
        }
      />
    );
  }

  // ======================================
  // HOME PAGE
  // ======================================

  return (
    <div className="app">

      {/* ==================================
          NAVBAR
      ================================== */}

      <nav className="navbar">

        <div
          className="navbar-logo"
          onClick={
            handleHome
          }
          style={{
            cursor: "pointer",
          }}
        >
          🏠 GharBazaar
        </div>

        <div className="navbar-links">

          <button
            type="button"
            onClick={
              handleHome
            }
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => {

              setSearchType(
                "Buy"
              );

              setPage(
                "home"
              );

              window.history.pushState(
                {},
                "",
                "/"
              );
            }}
          >
            Buy
          </button>

          <button
            type="button"
            onClick={() => {

              setSearchType(
                "Rent"
              );

              setPage(
                "home"
              );

              window.history.pushState(
                {},
                "",
                "/"
              );
            }}
          >
            Rent
          </button>

          {token && (
            <button
              type="button"
              onClick={() =>
                setPage(
                  "add-property"
                )
              }
            >
              Sell Property
            </button>
          )}

          {token && (
            <button
              type="button"
              onClick={
                openEnquiries
              }
            >
              📩 Enquiries
            </button>
          )}

          {token && (
            <button
              type="button"
              onClick={() =>
                setPage(
                  "favorites"
                )
              }
            >
              ❤️ My Favorites
            </button>
          )}

          {token && (
            <button
              type="button"
              onClick={() =>
                setPage(
                  "profile"
                )
              }
            >
              👤 Profile
            </button>
          )}

          {/* ==================================
              NOTIFICATIONS
          ================================== */}

          {token && (
            <div
              style={{
                position:
                  "relative",
                display:
                  "inline-block",
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                type="button"
                onClick={() => {

                  const next =
                    !showNotifications;

                  setShowNotifications(
                    next
                  );

                  if (next) {

                    fetchNotifications(
                      token
                    );
                  }
                }}
                style={{
                  position:
                    "relative",
                  padding:
                    "9px 13px",
                  border:
                    "1px solid #14786b",
                  borderRadius:
                    "7px",
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

                🔔 Notifications

                {unreadNotifications >
                  0 && (
                  <span
                    style={{
                      position:
                        "absolute",
                      top: "-8px",
                      right: "-8px",
                      minWidth:
                        "20px",
                      height:
                        "20px",
                      padding:
                        "0 5px",
                      borderRadius:
                        "50%",
                      background:
                        "#d9534f",
                      color:
                        "white",
                      fontSize:
                        "11px",
                      fontWeight:
                        "700",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      border:
                        "2px solid white",
                    }}
                  >
                    {unreadNotifications >
                    99
                      ? "99+"
                      : unreadNotifications}
                  </span>
                )}

              </button>

              {/* DROPDOWN */}

              {showNotifications && (
                <div
                  style={{
                    position:
                      "absolute",
                    top: "48px",
                    right: "0",
                    width: "360px",
                    maxWidth:
                      "calc(100vw - 30px)",
                    background:
                      "white",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "12px",
                    boxShadow:
                      "0 8px 25px rgba(0,0,0,0.15)",
                    zIndex: 9999,
                    overflow:
                      "hidden",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      padding:
                        "15px",
                      borderBottom:
                        "1px solid #eee",
                    }}
                  >

                    <strong
                      style={{
                        fontSize:
                          "16px",
                      }}
                    >
                      🔔 Notifications
                    </strong>

                    {unreadNotifications >
                      0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllNotificationsRead
                        }
                        style={{
                          border:
                            "none",
                          background:
                            "transparent",
                          color:
                            "#14786b",
                          cursor:
                            "pointer",
                          fontSize:
                            "12px",
                          fontWeight:
                            "600",
                        }}
                      >
                        Mark all read
                      </button>
                    )}

                  </div>

                  <div
                    style={{
                      maxHeight:
                        "420px",
                      overflowY:
                        "auto",
                    }}
                  >

                    {notificationLoading ? (

                      <div
                        style={{
                          padding:
                            "30px",
                          textAlign:
                            "center",
                          color:
                            "#777",
                        }}
                      >
                        Loading notifications...
                      </div>

                    ) : notifications.length ===
                      0 ? (

                      <div
                        style={{
                          padding:
                            "35px 20px",
                          textAlign:
                            "center",
                          color:
                            "#777",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "35px",
                            marginBottom:
                              "10px",
                          }}
                        >
                          🔔
                        </div>

                        <p
                          style={{
                            margin:
                              0,
                          }}
                        >
                          No notifications yet.
                        </p>

                      </div>

                    ) : (

                      notifications
                        .slice(0, 10)
                        .map(
                          (
                            notification
                          ) => (

                            <button
                              type="button"
                              key={
                                notification._id
                              }
                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }
                              style={{
                                width:
                                  "100%",
                                textAlign:
                                  "left",
                                border:
                                  "none",
                                borderBottom:
                                  "1px solid #eee",
                                background:
                                  notification.isRead
                                    ? "white"
                                    : "#eefaf7",
                                padding:
                                  "14px",
                                cursor:
                                  "pointer",
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap:
                                    "10px",
                                }}
                              >

                                <div
                                  style={{
                                    fontSize:
                                      "22px",
                                    flexShrink:
                                      0,
                                  }}
                                >
                                  {notification.type ===
                                  "EnquiryReply"
                                    ? "💬"
                                    : notification.type ===
                                      "EnquiryStatus"
                                    ? "📩"
                                    : notification.type ===
                                      "Enquiry"
                                    ? "📨"
                                    : "🏠"}
                                </div>

                                <div
                                  style={{
                                    flex: 1,
                                  }}
                                >

                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      justifyContent:
                                        "space-between",
                                      gap:
                                        "8px",
                                    }}
                                  >

                                    <strong
                                      style={{
                                        fontSize:
                                          "14px",
                                        color:
                                          "#222",
                                      }}
                                    >
                                      {
                                        notification.title
                                      }
                                    </strong>

                                    {!notification.isRead && (
                                      <span
                                        style={{
                                          width:
                                            "8px",
                                          height:
                                            "8px",
                                          borderRadius:
                                            "50%",
                                          background:
                                            "#14786b",
                                          marginTop:
                                            "5px",
                                          flexShrink:
                                            0,
                                        }}
                                      />
                                    )}

                                  </div>

                                  <p
                                    style={{
                                      margin:
                                        "5px 0 0",
                                      fontSize:
                                        "13px",
                                      lineHeight:
                                        "1.4",
                                      color:
                                        "#555",
                                    }}
                                  >
                                    {
                                      notification.message
                                    }
                                  </p>

                                  {notification.property && (
                                    <small
                                      style={{
                                        display:
                                          "block",
                                        marginTop:
                                          "7px",
                                        color:
                                          "#14786b",
                                        fontWeight:
                                          "600",
                                      }}
                                    >
                                      {notification.type ===
                                        "EnquiryReply" ||
                                      notification.type ===
                                        "EnquiryStatus" ||
                                      notification.type ===
                                        "Enquiry"
                                        ? "Open Enquiries →"
                                        : "View Property →"}
                                    </small>
                                  )}

                                </div>

                              </div>

                            </button>
                          )
                        )

                    )}

                  </div>

                </div>
              )}

            </div>
          )}

          {/* USER / LOGIN */}

          {token ? (
            <>

              <span
                style={{
                  fontWeight:
                    "600",
                  marginLeft:
                    "10px",
                }}
              >
                👤{" "}
                {user?.name ||
                  "User"}
              </span>

              <button
                type="button"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>

            </>
          ) : (
            <>

              <button
                type="button"
                onClick={() =>
                  setPage(
                    "login"
                  )
                }
              >
                Login
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage(
                    "register"
                  )
                }
              >
                Register
              </button>

            </>
          )}

        </div>
      </nav>

      {/* ==================================
          HERO
      ================================== */}

      <section className="hero">

        <div className="hero-content">

          <h1>
            Find Your Dream Home
          </h1>

          <p>
            Buy, rent and sell
            properties with
            GharBazaar
          </p>

          <div className="search-box">

            <div className="search-row">

              <select
                value={
                  searchType
                }
                onChange={(e) =>
                  setSearchType(
                    e.target.value
                  )
                }
              >

                <option value="Buy">
                  Buy
                </option>

                <option value="Rent">
                  Rent
                </option>

              </select>

              <input
                type="text"
                placeholder="Search property"
                value={
                  searchInput
                }
                onChange={(e) =>
                  setSearchInput(
                    e.target.value
                  )
                }
              />

              <input
                type="text"
                placeholder="Location"
                value={
                  searchLocation
                }
                onChange={(e) =>
                  setSearchLocation(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={
                  handleSearch
                }
              >
                Search
              </button>

            </div>

            <div className="filter-row">

              <select
                value={
                  propertyTypeFilter
                }
                onChange={(e) =>
                  setPropertyTypeFilter(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Property Types
                </option>

                <option value="House">
                  House
                </option>

                <option value="Flat">
                  Flat
                </option>

                <option value="Villa">
                  Villa
                </option>

                <option value="Plot">
                  Plot
                </option>

              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={
                  minPrice
                }
                onChange={(e) =>
                  setMinPrice(
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                placeholder="Max Price"
                value={
                  maxPrice
                }
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={
                  clearSearch
                }
              >
                Clear
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================
          PROPERTIES
      ================================== */}

      <section
        className="properties-section"
      >

        <div
          className="properties-container"
        >

          <div
            className="section-heading"
          >

            <h2>
              {searchType ===
              "Rent"
                ? "Properties for Rent"
                : "Properties for Sale"}
            </h2>

            <p>
              {
                filteredProperties.length
              }{" "}
              properties found
            </p>

          </div>

          {loading && (
            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "40px",
              }}
            >
              <p>
                Loading properties...
              </p>
            </div>
          )}

          {!loading &&
            error && (
              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "40px",
                  color:
                    "red",
                }}
              >
                <p>
                  {error}
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredProperties.length ===
              0 && (
              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "50px",
                }}
              >

                <h3>
                  No properties found
                </h3>

                <p>
                  Try changing
                  your search or
                  filters.
                </p>

              </div>
            )}

          {!loading &&
            !error &&
            filteredProperties.length >
              0 && (

              <div
                className="property-grid"
              >

                {filteredProperties.map(
                  (
                    property
                  ) => {

                    const propertyIsFavorite =
                      isFavorite(
                        property._id
                      );

                    return (

                      <div
                        className="property-card"
                        key={
                          property._id
                        }
                        onClick={() => {

                          openPropertyDetails(
                            property._id
                          );
                        }}
                        style={{
                          cursor:
                            "pointer",
                        }}
                      >

                        <div
                          className="property-image"
                        >

                          {property.images &&
                          property.images.length >
                            0 ? (

                            <>

                              <img
                                src={
                                  property
                                    .images[0]
                                }
                                alt={
                                  property.title
                                }
                              />

                              {property.images.length >
                                1 && (

                                <span className="property-photo-count">

                                  📸{" "}

                                  {
                                    property
                                      .images
                                      .length
                                  }

                                </span>
                              )}

                            </>

                          ) : (

                            <div className="property-image-placeholder">
                              🏠
                            </div>
                          )}

                        </div>

                        <div
                          className="property-content"
                        >

                          <span
                            className="property-listing-type"
                          >
                            {property.listingType ===
                            "Rent"
                              ? "For Rent"
                              : "For Sale"}
                          </span>

                          <h3>
                            {
                              property.title
                            }
                          </h3>

                          <p
                            className="property-location"
                          >
                            📍{" "}
                            {
                              property.location
                            }
                          </p>

                          <p>
                            🏠{" "}
                            {
                              property.propertyType
                            }
                          </p>

                          <div
                            className="property-features"
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

                          <h4
                            className="property-price"
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

                          </h4>

                          <button
                            type="button"
                            onClick={(e) =>
                              handleFavorite(
                                e,
                                property._id
                              )
                            }
                            style={{
                              marginTop:
                                "12px",

                              marginRight:
                                "8px",

                              padding:
                                "9px 14px",

                              border:
                                "1px solid #14786b",

                              borderRadius:
                                "7px",

                              background:
                                propertyIsFavorite
                                  ? "#14786b"
                                  : "white",

                              color:
                                propertyIsFavorite
                                  ? "white"
                                  : "#14786b",

                              cursor:
                                "pointer",

                              fontWeight:
                                "600",
                            }}
                          >

                            {propertyIsFavorite
                              ? "❤️ Favorited"
                              : "🤍 Favorite"}

                          </button>

                          {isPropertyOwner(
                            property
                          ) && (

                            <div
                              style={{
                                marginTop:
                                  "10px",
                              }}
                            >

                              <button
                                type="button"
                                onClick={(
                                  e
                                ) => {

                                  e.stopPropagation();

                                  handleEdit(
                                    property
                                  );
                                }}
                                style={{
                                  marginRight:
                                    "8px",

                                  padding:
                                    "8px 12px",

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
                                type="button"
                                onClick={(
                                  e
                                ) => {

                                  e.stopPropagation();

                                  handleDelete(
                                    property._id
                                  );
                                }}
                                style={{
                                  padding:
                                    "8px 12px",

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
                          )}

                          <button
                            type="button"
                            onClick={(e) => {

                              e.stopPropagation();

                              openPropertyDetails(
                                property._id
                              );
                            }}
                            style={{
                              marginTop:
                                "12px",

                              width:
                                "100%",

                              padding:
                                "10px",

                              border:
                                "none",

                              borderRadius:
                                "7px",

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
                            View Details
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

        </div>

      </section>

      {/* ==================================
          FOOTER
      ================================== */}

      <footer
        className="app-footer"
        style={{
          marginTop:
            "50px",

          padding:
            "25px",

          textAlign:
            "center",

          background:
            "#f5f5f5",

          color:
            "#666",
        }}
      >

        <div>
          © 2026 GharBazaar. All rights reserved.
        </div>

        <div
          style={{
            marginTop:
              "6px",

            color:
              "#222",

            fontWeight:
              "600",
          }}
        >
          Developed by Shreyash Bunjkar
        </div>

      </footer>

    </div>
  );
}

export default App;