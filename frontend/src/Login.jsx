import { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const response = await fetch(
        "https://gharbazaar-hb8d.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save login information
      localStorage.setItem(
        "gharbazaar_token",
        data.token
      );

      localStorage.setItem(
        "gharbazaar_user",
        JSON.stringify(data.user)
      );

      setMessage("Login successful!");

      // Tell App.jsx that login is successful
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }

      setFormData({
        email: "",
        password: "",
      });

    } catch (error) {
      console.log(error);
      setError(
        "Unable to connect to backend server"
      );
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>Welcome Back</h1>

        <p className="login-subtitle">
          Login to your GharBazaar account
        </p>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
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

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

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

        <p className="register-text">
          Don't have an account?{" "}
          <a href="#">
            Register
          </a>
        </p>

      </div>
    </div>
  );
}

export default Login;