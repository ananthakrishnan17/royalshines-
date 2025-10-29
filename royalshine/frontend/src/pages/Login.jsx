import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState({ admin: false, user: false });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Switch between user/admin tabs
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMessage("");
  };

  // Toggle show/hide password
  const handleTogglePassword = (type) => {
    setShowPassword((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // ✅ USER LOGIN FUNCTION (UPDATED)
  const handleUserLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email: userEmail,
        password: userPassword,
      });

      if (res.data.success) {
        setMessage("✅ User Login Successful!");

        // ✅ Save token, userId, and user info
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId); // ✅ NEW: Save userId
        localStorage.setItem("userName", res.data.user.name); // ✅ NEW: Save userName
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // ✅ Check if there's a pending wishlist item or cart item
        const pendingWishlistItem = localStorage.getItem("pendingWishlistItem");
        const pendingCartItem = localStorage.getItem("pendingCartItem");

        setTimeout(() => {
          if (pendingWishlistItem) {
            // ✅ Redirect to collections page if user was trying to add to wishlist
            navigate("/collections");
          } else if (pendingCartItem) {
            // ✅ Redirect to collections page if user was trying to add to cart
            navigate("/collections");
          } else {
            // ✅ Otherwise go to dashboard
            navigate("/user-dashboard");
          }
        }, 800);
      } else {
        setMessage("❌ " + (res.data.message || "Invalid Credentials"));
      }
    } catch (err) {
      console.error("❌ Login Error:", err);
      setMessage("❌ " + (err.response?.data?.message || "Server error. Please try again."));
    }
  };

  // ✅ ADMIN LOGIN FUNCTION (Updated to use API)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email: adminEmail,
        password: adminPassword,
      });

      if (res.data.success && res.data.isAdmin) {
        setMessage("✅ Admin Login Successful!");

        // ✅ Save admin session
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminEmail", adminEmail);

        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 800);
      } else {
        setMessage("❌ " + (res.data.message || "Invalid admin credentials"));
      }
    } catch (err) {
      console.error("❌ Admin Login Error:", err);
      setMessage("❌ " + (err.response?.data?.message || "Server error. Please try again."));
    }
  };

  return (
    <div className="login-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">💎 Royal Shine</div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/collections">Collections</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login" className="active">Login</Link></li>
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

      {/* Login Container */}
      <div className="login-container">
        <h2>Login Page</h2>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={activeTab === "admin" ? "active" : ""}
            onClick={() => handleTabClick("admin")}
          >
            Admin Login
          </button>
          <button
            className={activeTab === "user" ? "active" : ""}
            onClick={() => handleTabClick("user")}

>
            User Login
          </button>
        </div>

        {/* User Login Form */}
        {activeTab === "user" && (
          <div className="form-box active">
            <form onSubmit={handleUserLogin}>
              <label>Email:</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />

              <label>Password:</label>
              <input
                type={showPassword.user ? "text" : "password"}
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Enter password"
                required
              />

              <span
                className="show-password"
                onClick={() => handleTogglePassword("user")}
              >
                {showPassword.user ? "Hide Password" : "Show Password"}
              </span>

              <button type="submit">Login</button>
            </form>
          </div>
        )}

        {/* Admin Login Form */}
        {activeTab === "admin" && (
          <div className="form-box active">
            <form onSubmit={handleAdminLogin}>
              <label>Admin Email:</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Enter admin email"
                required
              />

              <label>Password:</label>
              <input
                type={showPassword.admin ? "text" : "password"}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                required
              />

              <span
                className="show-password"
                onClick={() => handleTogglePassword("admin")}
              >
                {showPassword.admin ? "Hide Password" : "Show Password"}
              </span>

              <button type="submit">Login</button>
            </form>
          </div>
        )}

        {/* Register Link */}
        <p className="register-link">
          New user? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
