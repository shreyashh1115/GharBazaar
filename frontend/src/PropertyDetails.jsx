import { useEffect, useState } from "react";
import "./PropertyDetails.css";

const API_URL = "https://gharbazaar-hb8d.onrender.com/api";

function PropertyDetails({
  propertyId,
  onBack,
  onViewDetails,
}) {
  const [property, setProperty] = useState(null);
  const [allProperties, setAllProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentImage, setCurrentImage] = useState(0);

  // ================================
  // QUERY
  // ================================

  const [showQueryForm, setShowQueryForm] =
    useState(false);

  const [queryMessage, setQueryMessage] =
    useState("");

  const [querySuccess, setQuerySuccess] =
    useState("");

  const [queryError, setQueryError] =
    useState("");

  const [queryLoading, setQueryLoading] =
    useState(false);

  // ================================
  // SHARE
  // ================================

  const [shareSuccess, setShareSuccess] =
    useState("");

  // ================================
  // FETCH PROPERTY
  // ================================

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/properties/${propertyId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load property"
          );

          return;
        }

        setProperty(data);
        setCurrentImage(0);
      } catch (error) {
        console.log(error);

        setError(
          "Unable to connect to backend server"
        );
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  // ================================
  // FETCH ALL PROPERTIES
  // ================================

  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        const response = await fetch(
          `${API_URL}/properties`
        );

        const data = await response.json();

        if (response.ok) {
          setAllProperties(data);
        }
      } catch (error) {
        console.log(
          "SIMILAR PROPERTIES ERROR:",
          error
        );
      }
    };

    fetchAllProperties();
  }, []);

  // ================================
  // IMAGES
  // ================================

  const images =
    property &&
    Array.isArray(property.images)
      ? property.images
      : [];

  const nextImage = () => {
    if (images.length === 0) {
      return;
    }

    setCurrentImage(
      (current) =>
        (current + 1) % images.length
    );
  };

  const previousImage = () => {
    if (images.length === 0) {
      return;
    }

    setCurrentImage(
      (current) =>
        (current - 1 + images.length) %
        images.length
    );
  };

  // ================================
  // SHARE PROPERTY
  // ================================

  const getPropertyUrl = () => {
    return window.location.href;
  };

  const handleShare = async () => {
    setShareSuccess("");

    const propertyUrl =
      getPropertyUrl();

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            property?.title ||
            "GharBazaar Property",
          text:
            `Check out this property on GharBazaar: ${
              property?.title || ""
            }`,
          url: propertyUrl,
        });

        setShareSuccess(
          "Property shared successfully!"
        );
      } else {
        await navigator.clipboard.writeText(
          propertyUrl
        );

        setShareSuccess(
          "Property link copied successfully!"
        );
      }
    } catch (error) {
      console.log(
        "SHARE ERROR:",
        error
      );
    }
  };

  // ================================
  // WHATSAPP SHARE
  // ================================

  const handleWhatsAppShare = () => {
    const propertyUrl =
      getPropertyUrl();

    const message =
      `Check out this property on GharBazaar:\n\n${
        property?.title || "Property"
      }\n📍 ${
        property?.location || ""
      }\n💰 ₹${Number(
        property?.price || 0
      ).toLocaleString("en-IN")}\n\n${
        propertyUrl
      }`;

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank"
    );
  };

  // ================================
  // COPY LINK
  // ================================

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        getPropertyUrl()
      );

      setShareSuccess(
        "Property link copied successfully!"
      );

      setTimeout(() => {
        setShareSuccess("");
      }, 3000);
    } catch (error) {
      console.log(
        "COPY LINK ERROR:",
        error
      );

      alert(
        "Unable to copy property link"
      );
    }
  };

  // ================================
  // SEND QUERY
  // ================================

  const handleSendQuery = async (
    event
  ) => {
    event.preventDefault();

    setQuerySuccess("");
    setQueryError("");

    if (!queryMessage.trim()) {
      setQueryError(
        "Please enter your message"
      );

      return;
    }

    const token = localStorage.getItem(
      "gharbazaar_token"
    );

    if (!token) {
      setQueryError(
        "Please login to send an enquiry"
      );

      return;
    }

    try {
      setQueryLoading(true);

      const response = await fetch(
        `${API_URL}/enquiries`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            propertyId:
              property._id,

            message:
              queryMessage.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setQueryError(
          data.message ||
            "Unable to send enquiry"
        );

        return;
      }

      setQuerySuccess(
        "Your enquiry has been sent successfully!"
      );

      setQueryMessage("");

      setTimeout(() => {
        setShowQueryForm(false);
      }, 1500);
    } catch (error) {
      console.log(
        "SEND QUERY ERROR:",
        error
      );

      setQueryError(
        "Unable to connect to backend server"
      );
    } finally {
      setQueryLoading(false);
    }
  };

  // ================================
  // SIMILAR PROPERTIES
  // ================================

  const similarProperties =
    property
      ? allProperties
          .filter(
            (item) =>
              item._id !== property._id &&
              item.propertyType ===
                property.propertyType
          )
          .sort(
            (a, b) =>
              Math.abs(
                Number(a.price) -
                  Number(property.price)
              ) -
              Math.abs(
                Number(b.price) -
                  Number(property.price)
              )
          )
          .slice(0, 4)
      : [];

  // ================================
  // OPEN SIMILAR PROPERTY
  // ================================

  const openProperty = (id) => {
    if (onViewDetails) {
      onViewDetails(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="property-details-page">
        <div className="property-details-container">
          <div className="details-loading">
            Loading property...
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // ERROR
  // ================================

  if (error) {
    return (
      <div className="property-details-page">
        <div className="property-details-container">
          <button
            className="details-back-button"
            onClick={onBack}
          >
            ← Back
          </button>

          <div className="details-error">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  // ================================
  // MAP
  // ================================

  const mapQuery = encodeURIComponent(
    property.location || ""
  );

  const mapEmbedUrl =
    `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  const googleMapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  // ================================
  // JSX
  // ================================

  return (
    <div className="property-details-page">

      <div className="property-details-container">

        {/* BACK */}

        <button
          className="details-back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        {/* MAIN CARD */}

        <div className="details-card">

          {/* ============================
              GALLERY
          ============================ */}

          <div className="details-gallery">

            <div className="main-image-container">

              {images.length > 0 ? (
                <>
                  <img
                    className="details-main-image"
                    src={
                      images[currentImage]
                    }
                    alt={
                      property.title
                    }
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        className="gallery-arrow gallery-prev"
                        onClick={
                          previousImage
                        }
                      >
                        ‹
                      </button>

                      <button
                        className="gallery-arrow gallery-next"
                        onClick={
                          nextImage
                        }
                      >
                        ›
                      </button>

                      <div className="image-counter">
                        {currentImage + 1} /{" "}
                        {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="no-image">
                  🏠
                  <span>
                    No image available
                  </span>
                </div>
              )}

            </div>

            {/* THUMBNAILS */}

            {images.length > 1 && (
              <div className="thumbnail-container">

                {images.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      className={`image-thumbnail ${
                        index ===
                        currentImage
                          ? "active-thumbnail"
                          : ""
                      }`}
                      onClick={() =>
                        setCurrentImage(
                          index
                        )
                      }
                    >
                      <img
                        src={image}
                        alt={`Property ${
                          index + 1
                        }`}
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* ============================
              DETAILS CONTENT
          ============================ */}

          <div className="details-content">

            <span className="details-listing-type">
              {property.listingType ===
              "Rent"
                ? "For Rent"
                : "For Sale"}
            </span>

            <h1>
              {property.title}
            </h1>

            <p className="details-location">
              📍 {property.location}
            </p>

            <h2 className="details-price">
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
            </h2>

            {/* FEATURES */}

            <div className="details-features">

              <div>
                <strong>
                  🛏️
                </strong>

                <span>
                  {property.bedrooms}{" "}
                  Bedrooms
                </span>
              </div>

              <div>
                <strong>
                  🛁
                </strong>

                <span>
                  {property.bathrooms}{" "}
                  Bathrooms
                </span>
              </div>

              <div>
                <strong>
                  📐
                </strong>

                <span>
                  {property.area}{" "}
                  sq.ft
                </span>
              </div>

            </div>

            {/* INFO */}

            <div className="details-info-grid">

              <div>
                <span>
                  Property Type
                </span>

                <strong>
                  {property.propertyType}
                </strong>
              </div>

              <div>
                <span>
                  Listing Type
                </span>

                <strong>
                  {property.listingType}
                </strong>
              </div>

              <div>
                <span>
                  Year Built
                </span>

                <strong>
                  {property.yearBuilt ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Furnished
                </span>

                <strong>
                  {property.furnished ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong>
                  {property.status ||
                    "Available"}
                </strong>
              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="details-description">

              <h3>
                Description
              </h3>

              <p>
                {property.description ||
                  "No description available for this property."}
              </p>

            </div>

            {/* ============================
                SHARE PROPERTY
            ============================ */}

            <div className="share-section">

              <div className="share-header">

                <h3>
                  Share this Property
                </h3>

                <p>
                  Share this property
                  with your friends
                  and family.
                </p>

              </div>

              <div className="share-buttons">

                <button
                  type="button"
                  className="share-property-button"
                  onClick={
                    handleShare
                  }
                >
                  🔗 Share Property
                </button>

                <button
                  type="button"
                  className="whatsapp-share-button"
                  onClick={
                    handleWhatsAppShare
                  }
                >
                  💬 WhatsApp
                </button>

                <button
                  type="button"
                  className="copy-link-button"
                  onClick={
                    handleCopyLink
                  }
                >
                  📋 Copy Link
                </button>

              </div>

              {shareSuccess && (
                <p className="share-success">
                  {shareSuccess}
                </p>
              )}

            </div>

            {/* ============================
                MAP
            ============================ */}

            <div className="property-map-section">

              <h3>
                📍 Property Location
              </h3>

              <p className="map-location-text">
                {property.location}
              </p>

              <div className="property-map">

                <iframe
                  title="Property Location"
                  src={mapEmbedUrl}
                  height="400"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="open-map-button"
              >
                🗺️ Open in Google Maps
              </a>

            </div>

            {/* ============================
                OWNER
            ============================ */}

            {property.owner && (
              <div className="owner-section">

                <h3>
                  👤 Property Owner
                </h3>

                <p>
                  <strong>
                    Name:
                  </strong>{" "}
                  {property.owner.name ||
                    "N/A"}
                </p>

                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {property.owner.email ||
                    "N/A"}
                </p>

                <p>
                  <strong>
                    Phone:
                  </strong>{" "}
                  {property.owner.phone ||
                    "N/A"}
                </p>

              </div>
            )}

            {/* ============================
                SEND QUERY
            ============================ */}

            <div className="query-section">

              <div className="query-header">

                <div>
                  <h3>
                    Interested in this
                    property?
                  </h3>

                  <p>
                    Contact the owner
                    by sending an
                    enquiry.
                  </p>
                </div>

                <button
                  type="button"
                  className="send-query-button"
                  onClick={() => {
                    setShowQueryForm(
                      !showQueryForm
                    );

                    setQueryError("");
                    setQuerySuccess("");
                  }}
                >
                  {showQueryForm
                    ? "Hide Query"
                    : "Send Query"}
                </button>

              </div>

              {showQueryForm && (
                <form
                  className="query-form"
                  onSubmit={
                    handleSendQuery
                  }
                >

                  <label>
                    Your Message
                  </label>

                  <textarea
                    value={
                      queryMessage
                    }
                    onChange={(e) =>
                      setQueryMessage(
                        e.target.value
                      )
                    }
                    placeholder="I am interested in this property. Please contact me."
                    rows="5"
                    required
                  />

                  <div className="query-actions">

                    <button
                      type="submit"
                      className="query-submit-button"
                      disabled={
                        queryLoading
                      }
                    >
                      {queryLoading
                        ? "Sending..."
                        : "📨 Send Enquiry"}
                    </button>

                  </div>

                  {querySuccess && (
                    <p className="query-success">
                      {querySuccess}
                    </p>
                  )}

                  {queryError && (
                    <p className="query-error">
                      {queryError}
                    </p>
                  )}

                </form>
              )}

            </div>

          </div>

        </div>

        {/* ================================
            SIMILAR PROPERTIES
        ================================= */}

        {similarProperties.length >
          0 && (
          <section className="similar-properties-section">

            <div className="similar-properties-heading">

              <h2>
                Similar Properties
              </h2>

              <p>
                Properties you may
                also like
              </p>

            </div>

            <div className="similar-properties-grid">

              {similarProperties.map(
                (item) => (
                  <div
                    className="similar-property-card"
                    key={item._id}
                    onClick={() =>
                      openProperty(
                        item._id
                      )
                    }
                  >

                    <div className="similar-property-image">

                      {item.images &&
                      item.images.length >
                        0 ? (
                        <img
                          src={
                            item.images[0]
                          }
                          alt={
                            item.title
                          }
                        />
                      ) : (
                        <div className="similar-no-image">
                          🏠
                        </div>
                      )}

                      <span className="similar-listing-badge">
                        {item.listingType ===
                        "Rent"
                          ? "For Rent"
                          : "For Sale"}
                      </span>

                    </div>

                    <div className="similar-property-content">

                      <h3>
                        {item.title}
                      </h3>

                      <p className="similar-location">
                        📍{" "}
                        {item.location}
                      </p>

                      <h4>
                        ₹
                        {Number(
                          item.price
                        ).toLocaleString(
                          "en-IN"
                        )}

                        {item.listingType ===
                        "Rent"
                          ? " / month"
                          : ""}
                      </h4>

                      <div className="similar-features">

                        <span>
                          🛏️{" "}
                          {item.bedrooms}
                        </span>

                        <span>
                          🛁{" "}
                          {item.bathrooms}
                        </span>

                        <span>
                          📐{" "}
                          {item.area} sq.ft
                        </span>

                      </div>

                      <button
                        type="button"
                        className="similar-view-button"
                        onClick={(e) => {
                          e.stopPropagation();

                          openProperty(
                            item._id
                          );
                        }}
                      >
                        View Details
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>
        )}

      </div>

    </div>
  );
}

export default PropertyDetails;