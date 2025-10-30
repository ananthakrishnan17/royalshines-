import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Add this for navigation
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "./Register.css";


const Register = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // ✅ Initialize navigate

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Registration successful! Please login now.");
        navigate("/login"); // ✅ go to login after register
      } else {
        setMessage("❌ " + (data.message || "Registration failed!"));
      }
    } catch (error) {
      console.error("❌ Register Error:", error);
      setMessage("❌ Something went wrong. Try again later.");
    }
  };

  // ✅ GOOGLE LOGIN FUNCTION
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/google-login", {
        credential: credentialResponse.credential,
      });

      if (res.data.success) {
        setMessage("✅ Google Login Successful!");

        // ✅ Save token, userId, and user info
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("userName", res.data.user.fullname);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // ✅ Check if there's a pending wishlist item or cart item
        const pendingWishlistItem = localStorage.getItem("pendingWishlistItem");
        const pendingCartItem = localStorage.getItem("pendingCartItem");

        setTimeout(() => {
          if (pendingWishlistItem) {
            navigate("/collections");
          } else if (pendingCartItem) {
            navigate("/collections");
          } else {
            navigate("/user-dashboard");
          }
        }, 800);
      } else {
        setMessage("❌ " + (res.data.message || "Google login failed"));
      }
    } catch (err) {
      console.error("❌ Google Login Error:", err);
      setMessage("❌ " + (err.response?.data?.message || "Google login failed"));
    }
  };

  const handleGoogleLoginError = () => {
    setMessage("❌ Google login failed");
  };

  return (
    <div>
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">💎 Royal Shine</div>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/collections">Collections</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </nav>
      </header>

      {/* Alert Message */}
      {message && (
        <div
          className={`alert ${message.startsWith("✅") ? "success" : "error"}`}
        >
          {message}
        </div>
      )}

      {/* Register Container */}
      <div className="register-container">
        <h2>💎 Royal Shine Jewels</h2>
        <h3>Join Our Exclusive Community</h3>

        {/* Register Form */}
        <div className="register-box">
          <form className="form-grid" onSubmit={handleRegister}>
            <label>Full Name</label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Enter your full name"
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />

            <div className="form-full">
              <button type="submit">Create Account</button>
            </div>
          </form>

          {/* Google Login Button */}
          <div className="google-login">
            <GoogleLogin
              clientId="214862082349-v26rc2j9l4k2lc5ciosmadk8feps8a29.apps.googleusercontent.com"
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>

          <p>
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
