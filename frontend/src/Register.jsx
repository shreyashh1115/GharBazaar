import { useState } from "react";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ================================
    // CHECK PASSWORD
    // ================================

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // ================================
    // CHECK PHONE NUMBER
    // ================================

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit contact number");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Registration failed"
        );

        return;
      }

      setMessage(
        "Registration successful!"
      );

      // ================================
      // RESET FORM
      // ================================

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.log(error);

      setError(
        "Unable to connect to backend server"
      );
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <h1>
          Create Account
        </h1>

        <p className="register-subtitle">
          Create your GharBazaar account
        </p>


        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          {/* FULL NAME */}

          <label htmlFor="name">
            Full Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />


          {/* EMAIL */}

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />


          {/* CONTACT NUMBER */}

          <label htmlFor="phone">
            Contact Number
          </label>

          <input
            id="phone"
            type="tel"
            placeholder="Enter 10-digit contact number"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
            inputMode="numeric"
            required
          />


          {/* PASSWORD */}

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />


          {/* CONFIRM PASSWORD */}

          <label htmlFor="confirmPassword">
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />


          {/* REGISTER BUTTON */}

          <button
            className="register-button"
            type="submit"
          >
            Register
          </button>

        </form>


        {/* SUCCESS MESSAGE */}

        {message && (
          <p
            style={{
              color: "green",
              marginTop: "15px",
            }}
          >
            {message}
          </p>
        )}


        {/* ERROR MESSAGE */}

        {error && (
          <p
            style={{
              color: "red",
              marginTop: "15px",
            }}
          >
            {error}
          </p>
        )}


        <p className="login-text">
          Already have an account?{" "}

          <a href="#">
            Login
          </a>
        </p>

      </div>

    </div>
  );
}

export default Register;