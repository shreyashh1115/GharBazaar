import React, {
  useEffect,
  useState,
} from "react";

import "./Enquiries.css";

const API_URL =
  "http://localhost:5000";

const Enquiries = ({
  onViewDetails,
  onViewProperty,
  onBack,
  token: tokenProp,
  user: userProp,
  initialEnquiryId = null,
}) => {

  // ========================================
  // AUTH
  // ========================================

  const token =
    tokenProp ||
    localStorage.getItem(
      "gharbazaar_token"
    );

  const currentUser =
    userProp ||
    JSON.parse(
      localStorage.getItem(
        "gharbazaar_user"
      ) || "null"
    );

  // ========================================
  // STATES
  // ========================================

  const [
    receivedEnquiries,
    setReceivedEnquiries,
  ] = useState([]);

  const [
    myEnquiries,
    setMyEnquiries,
  ] = useState([]);

  const [
    selectedEnquiry,
    setSelectedEnquiry,
  ] = useState(null);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    messageLoading,
    setMessageLoading,
  ] = useState(false);

  const [
    activeTab,
    setActiveTab,
  ] = useState("received");

  const [
    statusUpdating,
    setStatusUpdating,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  // ========================================
  // FETCH RECEIVED ENQUIRIES
  // ========================================

  const fetchReceivedEnquiries =
    async () => {

      if (!token) {
        return;
      }

      try {

        const response =
          await fetch(
            `${API_URL}/api/enquiries/seller`,
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

          setReceivedEnquiries(
            Array.isArray(data)
              ? data
              : []
          );

        } else {

          console.log(
            "RECEIVED ENQUIRIES ERROR:",
            data.message
          );

        }

      } catch (error) {

        console.log(
          "FETCH RECEIVED ENQUIRIES ERROR:",
          error
        );

      }
    };

  // ========================================
  // FETCH MY ENQUIRIES
  // ========================================

  const fetchMyEnquiries =
    async () => {

      if (!token) {
        return;
      }

      try {

        const response =
          await fetch(
            `${API_URL}/api/enquiries/buyer`,
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

          setMyEnquiries(
            Array.isArray(data)
              ? data
              : []
          );

        } else {

          console.log(
            "MY ENQUIRIES ERROR:",
            data.message
          );

        }

      } catch (error) {

        console.log(
          "FETCH MY ENQUIRIES ERROR:",
          error
        );

      }
    };

  // ========================================
  // LOAD ALL ENQUIRIES
  // ========================================

  const loadEnquiries =
    async () => {

      if (!token) {

        setLoading(false);

        return;
      }

      setLoading(true);

      await Promise.all([
        fetchReceivedEnquiries(),
        fetchMyEnquiries(),
      ]);

      setLoading(false);
    };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {

    loadEnquiries();

  }, [token]);

  // ========================================
  // OPEN ENQUIRY
  // ========================================

  const openEnquiry =
    async (enquiry) => {

      if (!enquiry) {
        return;
      }

      setSelectedEnquiry(
        enquiry
      );

      setMessages([]);

      setMessageLoading(true);

      try {

        /*
          Reply feature is no longer used.
          We only keep this request so old
          enquiry message data does not break
          the existing conversation screen.
        */

        const response =
          await fetch(
            `${API_URL}/api/enquiry-messages/${enquiry._id}`,
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

          setMessages(
            Array.isArray(data)
              ? data
              : []
          );

        } else {

          setMessages([]);

        }

      } catch (error) {

        console.log(
          "LOAD MESSAGES ERROR:",
          error
        );

        setMessages([]);

      } finally {

        setMessageLoading(false);

      }
    };

  // ========================================
  // OPEN INITIAL ENQUIRY
  // FROM NOTIFICATION
  // ========================================

  useEffect(() => {

    if (!initialEnquiryId) {
      return;
    }

    const allEnquiries = [
      ...receivedEnquiries,
      ...myEnquiries,
    ];

    const foundEnquiry =
      allEnquiries.find(
        (item) =>
          item._id ===
          initialEnquiryId
      );

    if (!foundEnquiry) {
      return;
    }

    const isReceived =
      receivedEnquiries.some(
        (item) =>
          item._id ===
          initialEnquiryId
      );

    setActiveTab(
      isReceived
        ? "received"
        : "sent"
    );

    openEnquiry(
      foundEnquiry
    );

  }, [
    initialEnquiryId,
    receivedEnquiries,
    myEnquiries,
  ]);

  // ========================================
  // UPDATE ENQUIRY STATUS
  // ========================================

  const updateStatus =
    async (
      enquiryId,
      status
    ) => {

      if (!token) {
        return;
      }

      try {

        setStatusUpdating(true);

        const response =
          await fetch(
            `${API_URL}/api/enquiries/${enquiryId}/status`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                status,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          alert(
            data.message ||
              "Unable to update status"
          );

          return;
        }

        const updatedStatus =
          data.status ||
          status;

        // Update received list
        setReceivedEnquiries(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                enquiryId
                  ? {
                      ...item,
                      status:
                        updatedStatus,
                    }
                  : item
            )
        );

        // Update selected enquiry
        setSelectedEnquiry(
          (previous) =>
            previous &&
            previous._id ===
              enquiryId
              ? {
                  ...previous,
                  status:
                    updatedStatus,
                }
              : previous
        );

      } catch (error) {

        console.log(
          "UPDATE STATUS ERROR:",
          error
        );

        alert(
          "Unable to update enquiry status."
        );

      } finally {

        setStatusUpdating(false);

      }
    };

  // ========================================
  // DELETE ENQUIRY
  // ========================================

  const deleteEnquiry =
    async (enquiryId) => {

      if (!enquiryId) {
        return;
      }

      if (!token) {

        alert(
          "Please login first."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this enquiry?"
        );

      if (!confirmed) {
        return;
      }

      try {

        setDeleting(true);

        const response =
          await fetch(
            `${API_URL}/api/enquiries/${enquiryId}`,
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
              "Unable to delete enquiry"
          );

          return;
        }

        // Remove from received enquiries
        setReceivedEnquiries(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !==
                enquiryId
            )
        );

        // Remove from my enquiries
        setMyEnquiries(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !==
                enquiryId
            )
        );

        // Close selected enquiry
        if (
          selectedEnquiry?._id ===
          enquiryId
        ) {

          setSelectedEnquiry(
            null
          );

          setMessages([]);

        }

        alert(
          "Enquiry deleted successfully."
        );

      } catch (error) {

        console.log(
          "DELETE ENQUIRY ERROR:",
          error
        );

        alert(
          "Something went wrong while deleting enquiry."
        );

      } finally {

        setDeleting(false);

      }
    };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate =
    (date) => {

      if (!date) {
        return "";
      }

      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    };

  // ========================================
  // VIEW PROPERTY
  // ========================================

  const handleViewProperty =
    (propertyId) => {

      if (!propertyId) {
        return;
      }

      if (onViewProperty) {

        onViewProperty(
          propertyId
        );

        return;
      }

      if (onViewDetails) {

        onViewDetails(
          propertyId
        );

      }
    };

  // ========================================
  // EMPTY STATE
  // ========================================

  const EmptyState = ({
    title,
    message,
  }) => (

    <div className="enquiries-empty">

      <div className="empty-icon">
        💬
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {message}
      </p>

    </div>
  );

  // ========================================
  // ENQUIRY CARD
  // ========================================

  const EnquiryCard = ({
    enquiry,
    type,
  }) => {

    const isReceived =
      type === "received";

    const person =
      isReceived
        ? enquiry.buyer
        : enquiry.seller;

    const status =
      enquiry.status ||
      "New";

    return (

      <div
        className={`enquiry-card ${
          selectedEnquiry?._id ===
          enquiry._id
            ? "active"
            : ""
        }`}
        onClick={() =>
          openEnquiry(
            enquiry
          )
        }
      >

        {/* PERSON + STATUS */}

        <div className="enquiry-card-top">

          <div className="enquiry-person">

            <div className="person-avatar">

              {person?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}

            </div>

            <div>

              <h3>
                {person?.name ||
                  "Unknown User"}
              </h3>

              <span>
                {isReceived
                  ? "Buyer"
                  : "Seller"}
              </span>

            </div>

          </div>

          <span
            className={`status-badge status-${status.toLowerCase()}`}
          >
            {status}
          </span>

        </div>

        {/* PROPERTY */}

        <div className="enquiry-property">

          <div className="property-mini-image">

            {enquiry.property
              ?.images?.[0] ? (

              <img
                src={
                  enquiry.property
                    .images[0]
                }
                alt={
                  enquiry.property
                    ?.title ||
                  "Property"
                }
              />

            ) : (

              <span>
                🏠
              </span>

            )}

          </div>

          <div>

            <h4>
              {enquiry.property
                ?.title ||
                "Property"}
            </h4>

            <p>
              📍{" "}
              {enquiry.property
                ?.location ||
                "Location"}
            </p>

            <p className="property-price">

              ₹{" "}

              {Number(
                enquiry.property
                  ?.price ||
                0
              ).toLocaleString(
                "en-IN"
              )}

            </p>

          </div>

        </div>

        {/* ORIGINAL MESSAGE */}

        <div className="original-message">

          <strong>
            {isReceived
              ? "Buyer Query:"
              : "Your Query:"}
          </strong>

          <p>
            {enquiry.message}
          </p>

        </div>

        {/* DATE */}

        <div className="enquiry-date">

          {formatDate(
            enquiry.createdAt
          )}

        </div>

      </div>

    );
  };

  // ========================================
  // NOT LOGGED IN
  // ========================================

  if (!token) {

    return (

      <div className="enquiries-page">

        <div className="enquiries-login-message">

          <h2>
            Please Login
          </h2>

          <p>
            Login to view your enquiries.
          </p>

        </div>

      </div>

    );

  }

  // ========================================
  // MAIN UI
  // ========================================

  return (

    <div className="enquiries-page">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="enquiries-header">

        <div>

          <h1>
            Enquiries
          </h1>

          <p>
            Manage your property
            enquiries in one place.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >

          {onBack && (

            <button
              type="button"
              className="refresh-enquiries-btn"
              onClick={onBack}
            >
              ← Back
            </button>

          )}

          <button
            type="button"
            className="refresh-enquiries-btn"
            onClick={loadEnquiries}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "🔄 Refresh"}
          </button>

        </div>

      </div>

      {/* ==================================
          TABS
      ================================== */}

      <div className="enquiry-tabs">

        <button
          type="button"
          className={
            activeTab === "received"
              ? "active"
              : ""
          }
          onClick={() => {

            setActiveTab(
              "received"
            );

            setSelectedEnquiry(
              null
            );

            setMessages([]);

          }}
        >

          📥 Received

          <span>
            {
              receivedEnquiries.length
            }
          </span>

        </button>

        <button
          type="button"
          className={
            activeTab === "sent"
              ? "active"
              : ""
          }
          onClick={() => {

            setActiveTab(
              "sent"
            );

            setSelectedEnquiry(
              null
            );

            setMessages([]);

          }}
        >

          📤 My Enquiries

          <span>
            {
              myEnquiries.length
            }
          </span>

        </button>

      </div>

      {/* ==================================
          MAIN CONTENT
      ================================== */}

      <div className="enquiries-layout">

        {/* ==================================
            LEFT SIDE
        ================================== */}

        <div className="enquiries-list">

          {loading ? (

            <div className="enquiries-loading">

              <div className="loading-spinner">
              </div>

              <p>
                Loading enquiries...
              </p>

            </div>

          ) : activeTab ===
            "received" ? (

            receivedEnquiries.length ===
            0 ? (

              <EmptyState
                title="No Received Enquiries"
                message="You don't have any property enquiries yet."
              />

            ) : (

              receivedEnquiries.map(
                (enquiry) => (

                  <EnquiryCard
                    key={
                      enquiry._id
                    }
                    enquiry={
                      enquiry
                    }
                    type="received"
                  />

                )
              )

            )

          ) : (

            myEnquiries.length ===
            0 ? (

              <EmptyState
                title="No Enquiries"
                message="You haven't sent any property enquiries yet."
              />

            ) : (

              myEnquiries.map(
                (enquiry) => (

                  <EnquiryCard
                    key={
                      enquiry._id
                    }
                    enquiry={
                      enquiry
                    }
                    type="sent"
                  />

                )
              )

            )

          )}

        </div>

        {/* ==================================
            RIGHT SIDE
        ================================== */}

        <div className="conversation-panel">

          {!selectedEnquiry ? (

            <div className="conversation-empty">

              <div>
                💬
              </div>

              <h2>
                Select an Enquiry
              </h2>

              <p>
                Select an enquiry from
                the left side to view
                the enquiry.
              </p>

            </div>

          ) : (

            <>

              {/* ==================================
                  CONVERSATION HEADER
              ================================== */}

              <div className="conversation-header">

                <div>

                  <h2>
                    {selectedEnquiry
                      .property
                      ?.title ||
                      "Property Enquiry"}
                  </h2>

                  <p>
                    📍{" "}
                    {selectedEnquiry
                      .property
                      ?.location ||
                      "Location"}
                  </p>

                </div>

                <span
                  className={`status-badge status-${(
                    selectedEnquiry.status ||
                    "New"
                  ).toLowerCase()}`}
                >
                  {selectedEnquiry.status ||
                    "New"}
                </span>

              </div>

              {/* ==================================
                  DELETE + VIEW PROPERTY
              ================================== */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                }}
              >

                {selectedEnquiry.property
                  ?._id && (

                  <button
                    type="button"
                    className="view-property-btn"
                    onClick={() =>
                      handleViewProperty(
                        selectedEnquiry
                          .property
                          ._id
                      )
                    }
                  >
                    🏠 View Property
                  </button>

                )}

                <button
                  type="button"
                  onClick={() =>
                    deleteEnquiry(
                      selectedEnquiry._id
                    )
                  }
                  disabled={deleting}
                  style={{
                    padding:
                      "10px 16px",
                    border:
                      "none",
                    borderRadius:
                      "8px",
                    background:
                      "#dc2626",
                    color:
                      "#ffffff",
                    cursor:
                      deleting
                        ? "not-allowed"
                        : "pointer",
                    fontWeight:
                      "600",
                    opacity:
                      deleting
                        ? 0.7
                        : 1,
                  }}
                >
                  {deleting
                    ? "Deleting..."
                    : "🗑️ Delete Enquiry"}
                </button>

              </div>

              {/* ==================================
                  STATUS CONTROL
              ================================== */}

              {receivedEnquiries.some(
                (item) =>
                  item._id ===
                  selectedEnquiry._id
              ) && (

                <div className="status-control">

                  <label>
                    Enquiry Status
                  </label>

                  <select
                    value={
                      selectedEnquiry.status ||
                      "New"
                    }
                    disabled={
                      statusUpdating
                    }
                    onChange={(event) =>
                      updateStatus(
                        selectedEnquiry._id,
                        event.target.value
                      )
                    }
                  >

                    <option value="New">
                      New
                    </option>

                    <option value="Contacted">
                      Contacted
                    </option>

                    <option value="Closed">
                      Closed
                    </option>

                  </select>

                </div>

              )}

              {/* ==================================
                  ENQUIRY MESSAGE
              ================================== */}

              <div className="messages-container">

                {messageLoading ? (

                  <div className="messages-loading">

                    <div className="loading-spinner">
                    </div>

                    <p>
                      Loading enquiry...
                    </p>

                  </div>

                ) : (

                  <div className="message-bubble buyer-message">

                    <div className="message-user">

                      <strong>
                        {selectedEnquiry
                          .buyer
                          ?.name ||
                          "Buyer"}
                      </strong>

                      <span>
                        Original Query
                      </span>

                    </div>

                    <p>
                      {
                        selectedEnquiry.message
                      }
                    </p>

                    <small>
                      {formatDate(
                        selectedEnquiry.createdAt
                      )}
                    </small>

                  </div>

                )}

              </div>

            </>

          )}

        </div>

      </div>

    </div>

  );
};

export default Enquiries;