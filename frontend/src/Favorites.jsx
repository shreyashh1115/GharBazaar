import { useEffect, useState } from "react";

function Favorites({
  token,
  onBack,
  onViewDetails,
}) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load favorites"
        );
        return;
      }

      setFavorites(data);

    } catch (error) {
      console.log(error);

      setError(
        "Unable to connect to backend server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFavorites();
    }
  }, [token]);

  const handleRemoveFavorite = async (
    propertyId
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/favorites/${propertyId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to remove favorite"
        );
        return;
      }

      setFavorites((currentFavorites) =>
        currentFavorites.filter(
          (property) =>
            property._id !== propertyId
        )
      );

    } catch (error) {
      console.log(error);

      alert(
        "Unable to connect to backend server"
      );
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>❤️ My Favorites</h2>
        <p>Loading favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "10px 18px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <h2>❤️ My Favorites</h2>

        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <button
        onClick={onBack}
        style={{
          padding: "10px 18px",
          marginBottom: "25px",
          border: "1px solid #14786b",
          borderRadius: "7px",
          background: "white",
          color: "#14786b",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        ← Back to Home
      </button>

      <h1
        style={{
          marginBottom: "8px",
        }}
      >
        ❤️ My Favorites
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: "30px",
        }}
      >
        Properties you have saved
      </p>

      {favorites.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px",
            }}
          >
            🤍
          </div>

          <h2>
            No Favorite Properties
          </h2>

          <p
            style={{
              color: "#666",
            }}
          >
            You haven't added any properties
            to your favorites yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px",
          }}
        >
          {favorites.map((property) => (
            <div
              key={property._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                overflow: "hidden",
                background: "white",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  height: "200px",
                  background: "#f2f2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {property.images &&
                property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "55px",
                    }}
                  >
                    🏠
                  </span>
                )}
              </div>

              <div
                style={{
                  padding: "18px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    background: "#e8f5f2",
                    color: "#14786b",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {property.listingType ===
                  "Rent"
                    ? "For Rent"
                    : "For Sale"}
                </span>

                <h2
                  style={{
                    margin:
                      "12px 0 8px",
                    fontSize: "21px",
                  }}
                >
                  {property.title}
                </h2>

                <p
                  style={{
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  📍 {property.location}
                </p>

                <p
                  style={{
                    fontWeight: "700",
                    fontSize: "20px",
                    color: "#14786b",
                  }}
                >
                  ₹
                  {Number(
                    property.price
                  ).toLocaleString("en-IN")}

                  {property.listingType ===
                  "Rent"
                    ? " / month"
                    : ""}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "12px",
                    color: "#555",
                    fontSize: "14px",
                  }}
                >
                  <span>
                    🛏️ {property.bedrooms}
                  </span>

                  <span>
                    🛁 {property.bathrooms}
                  </span>

                  <span>
                    📐 {property.area} sq.ft
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "18px",
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
                      padding: "10px",
                      border: "none",
                      borderRadius: "7px",
                      background: "#14786b",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    View Details
                  </button>

                  <button
                    onClick={() =>
                      handleRemoveFavorite(
                        property._id
                      )
                    }
                    style={{
                      padding:
                        "10px 14px",
                      border:
                        "1px solid #d9534f",
                      borderRadius: "7px",
                      background: "white",
                      color: "#d9534f",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    ❤️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;