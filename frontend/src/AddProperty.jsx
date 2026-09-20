import { useState } from "react";
import "./AddProperty.css";

function AddProperty({
  token,
  onPropertyAdded,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    yearBuilt: "",
    location: "",
    propertyType: "House",
    listingType: "Sale",
    furnished: "Unfurnished",
  });

  const [selectedImages, setSelectedImages] =
    useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // ========================================
  // SELECT MULTIPLE IMAGES
  // ========================================

  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    setError("");

    if (files.length === 0) {
      return;
    }


    // Maximum 10 images
    if (
      selectedImages.length +
        files.length >
      10
    ) {
      setError(
        "You can upload maximum 10 photos."
      );

      return;
    }


    // Validate file types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const invalidFile =
      files.find(
        (file) =>
          !allowedTypes.includes(
            file.type
          )
      );

    if (invalidFile) {
      setError(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      return;
    }


    // Validate file size
    const largeFile =
      files.find(
        (file) =>
          file.size >
          5 * 1024 * 1024
      );

    if (largeFile) {
      setError(
        "Each image must be smaller than 5MB."
      );

      return;
    }


    setSelectedImages([
      ...selectedImages,
      ...files,
    ]);

    // Reset input so same image can be selected again
    e.target.value = "";
  };


  // ========================================
  // REMOVE IMAGE
  // ========================================

  const removeImage = (index) => {
    setSelectedImages(
      selectedImages.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };


  // ========================================
  // SUBMIT PROPERTY
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);


    try {

      if (!token) {
        setError(
          "Please login before adding a property."
        );

        setLoading(false);

        return;
      }


      // ========================================
      // STEP 1: UPLOAD IMAGES
      // ========================================

      let imageUrls = [];


      if (
        selectedImages.length > 0
      ) {

        const imageFormData =
          new FormData();


        selectedImages.forEach(
          (image) => {
            imageFormData.append(
              "images",
              image
            );
          }
        );


        const uploadResponse =
          await fetch(
            "https://gharbazaar-hb8d.onrender.com/api/upload/multiple",
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body:
                imageFormData,
            }
          );


        const uploadData =
          await uploadResponse.json();


        if (!uploadResponse.ok) {
          setError(
            uploadData.message ||
              "Image upload failed."
          );

          setLoading(false);

          return;
        }


        imageUrls =
          uploadData.imageUrls ||
          [];
      }


      // ========================================
      // STEP 2: CREATE PROPERTY
      // ========================================

      const propertyResponse =
        await fetch(
          "https://gharbazaar-hb8d.onrender.com/api/properties",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({

              title:
                formData.title,

              description:
                formData.description,

              price:
                Number(
                  formData.price
                ),

              area:
                Number(
                  formData.area
                ),

              bedrooms:
                Number(
                  formData.bedrooms
                ),

              bathrooms:
                Number(
                  formData.bathrooms
                ),

              yearBuilt:
                formData.yearBuilt
                  ? Number(
                      formData.yearBuilt
                    )
                  : undefined,

              location:
                formData.location,

              propertyType:
                formData.propertyType,

              listingType:
                formData.listingType,

              furnished:
                formData.furnished,

              images:
                imageUrls,

              status:
                "Available",
            }),
          }
        );


      const propertyData =
        await propertyResponse.json();


      if (!propertyResponse.ok) {
        setError(
          propertyData.message ||
            "Property could not be added."
        );

        setLoading(false);

        return;
      }


      // ========================================
      // SUCCESS
      // ========================================

      setMessage(
        "Property added successfully!"
      );


      setFormData({
        title: "",
        description: "",
        price: "",
        area: "",
        bedrooms: "",
        bathrooms: "",
        yearBuilt: "",
        location: "",
        propertyType: "House",
        listingType: "Sale",
        furnished: "Unfurnished",
      });


      setSelectedImages([]);


      if (onPropertyAdded) {
        onPropertyAdded(
          propertyData.property
        );
      }


    } catch (error) {

      console.log(
        "ADD PROPERTY ERROR:"
      );

      console.log(error);

      setError(
        "Unable to connect to backend server."
      );

    }


    setLoading(false);
  };


  // ========================================
  // UI
  // ========================================

  return (
    <div className="add-property-page">

      <div className="add-property-card">

        <div className="add-property-header">

          <div>
            <h1>
              Add Property
            </h1>

            <p>
              Add your property to
              GharBazaar
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              className="add-property-cancel"
              onClick={onCancel}
            >
              ← Back
            </button>
          )}

        </div>


        <form
          className="add-property-form"
          onSubmit={handleSubmit}
        >

          {/* ========================================
              BASIC INFORMATION
          ======================================== */}

          <div className="form-section">

            <h2>
              Property Information
            </h2>


            <label>
              Property Title
            </label>

            <input
              type="text"
              name="title"
              placeholder="Enter property title"
              value={formData.title}
              onChange={handleChange}
              required
            />


            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Describe your property"
              value={
                formData.description
              }
              onChange={handleChange}
              rows="5"
            />

          </div>


          {/* ========================================
              PRICE AND LOCATION
          ======================================== */}

          <div className="form-section">

            <h2>
              Price & Location
            </h2>


            <div className="form-grid">

              <div>
                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>


              <div>
                <label>
                  Area (sq.ft)
                </label>

                <input
                  type="number"
                  name="area"
                  placeholder="Enter area"
                  value={formData.area}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

            </div>


            <label>
              Location
            </label>

            <input
              type="text"
              name="location"
              placeholder="Enter property location"
              value={formData.location}
              onChange={handleChange}
              required
            />

          </div>


          {/* ========================================
              PROPERTY DETAILS
          ======================================== */}

          <div className="form-section">

            <h2>
              Property Details
            </h2>


            <div className="form-grid">

              <div>

                <label>
                  Property Type
                </label>

                <select
                  name="propertyType"
                  value={
                    formData.propertyType
                  }
                  onChange={handleChange}
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

              </div>


              <div>

                <label>
                  Listing Type
                </label>

                <select
                  name="listingType"
                  value={
                    formData.listingType
                  }
                  onChange={handleChange}
                >

                  <option value="Sale">
                    For Sale
                  </option>

                  <option value="Rent">
                    For Rent
                  </option>

                </select>

              </div>


              <div>

                <label>
                  Bedrooms
                </label>

                <input
                  type="number"
                  name="bedrooms"
                  placeholder="Bedrooms"
                  value={
                    formData.bedrooms
                  }
                  onChange={handleChange}
                  min="0"
                  required
                />

              </div>


              <div>

                <label>
                  Bathrooms
                </label>

                <input
                  type="number"
                  name="bathrooms"
                  placeholder="Bathrooms"
                  value={
                    formData.bathrooms
                  }
                  onChange={handleChange}
                  min="0"
                  required
                />

              </div>


              <div>

                <label>
                  Year Built
                </label>

                <input
                  type="number"
                  name="yearBuilt"
                  placeholder="Year built"
                  value={
                    formData.yearBuilt
                  }
                  onChange={handleChange}
                  min="1800"
                  max="2100"
                />

              </div>


              <div>

                <label>
                  Furnished
                </label>

                <select
                  name="furnished"
                  value={
                    formData.furnished
                  }
                  onChange={handleChange}
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

              </div>

            </div>

          </div>


          {/* ========================================
              MULTIPLE PHOTOS
          ======================================== */}

          <div className="form-section">

            <h2>
              Property Photos
            </h2>

            <p className="photo-help">
              Add up to 10 photos.
              Each photo must be
              smaller than 5MB.
            </p>


            <label
              className="photo-upload-box"
            >

              <span className="photo-upload-icon">
                📸
              </span>

              <strong>
                Select Property Photos
              </strong>

              <small>
                JPG, JPEG, PNG or WEBP
              </small>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={
                  handleImageChange
                }
              />

            </label>


            {/* PHOTO PREVIEW */}

            {selectedImages.length >
              0 && (

              <div className="image-preview-grid">

                {selectedImages.map(
                  (image, index) => {

                    const imageUrl =
                      URL.createObjectURL(
                        image
                      );

                    return (

                      <div
                        className="image-preview-item"
                        key={`${image.name}-${index}`}
                      >

                        <img
                          src={imageUrl}
                          alt={`Property ${index + 1}`}
                        />

                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={() =>
                            removeImage(
                              index
                            )
                          }
                        >
                          ×
                        </button>

                        <span>
                          Photo {index + 1}
                        </span>

                      </div>

                    );

                  }
                )}

              </div>

            )}


            {selectedImages.length >
              0 && (

              <p className="photo-count">
                {selectedImages.length}
                /10 photos selected
              </p>

            )}

          </div>


          {/* ========================================
              MESSAGES
          ======================================== */}

          {message && (

            <div className="success-message">
              {message}
            </div>

          )}


          {error && (

            <div className="error-message">
              {error}
            </div>

          )}


          {/* ========================================
              SUBMIT
          ======================================== */}

          <button
            type="submit"
            className="add-property-button"
            disabled={loading}
          >

            {loading
              ? "Uploading & Saving..."
              : "Add Property"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default AddProperty;