import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Here you can send formData to backend API
    console.log("Registered user:", formData);
    alert("Registration successful!");
    navigate("/login");
  };

  return (
    <div style={{
      fontFamily: "'Poppins', sans-serif",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fef9f3, #fff1e6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative"
    }}>
      {/* Navbar */}
      <div style={{
        position: "absolute",
        top: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 50px",
        background: "rgba(255,255,255,0.9)",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        zIndex: 100
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "goldenrod" }}>💎 Royal Shine</div>
        <ul style={{ display: "flex", listStyle: "none" }}>
          <li style={{ marginLeft: "25px" }}><Link to="/" style={{ textDecoration: "none", color: "#333" }}>Home</Link></li>
          <li style={{ marginLeft: "25px" }}><Link to="/about" style={{ textDecoration: "none", color: "#333" }}>About</Link></li>
          <li style={{ marginLeft: "25px" }}><Link to="/collections" style={{ textDecoration: "none", color: "#333" }}>Collections</Link></li>
          <li style={{ marginLeft: "25px" }}><Link to="/login" style={{ textDecoration: "none", color: "#333" }}>Login</Link></li>
        </ul>
      </div>

      {/* Register Box */}
      <div style={{
        background: "#fff",
        padding: "40px 30px",
        width: "400px",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "goldenrod", fontSize: "28px", marginBottom: "5px" }}>Royal Shine Jewels</h2>
        <h3 style={{ marginBottom: "25px", fontWeight: "600", color: "#333" }}>Create Account</h3>

        <form onSubmit={handleSubmit}>
          <input type="text" name="fullName" placeholder="Full Name" required value={formData.fullName} onChange={handleChange} style={inputStyle} />
          <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} style={inputStyle} />
          <input type="text" name="phone" placeholder="Phone Number" required value={formData.phone} onChange={handleChange} style={inputStyle} />
          <input type="password" name="password" placeholder="Password" required value={formData.password} onChange={handleChange} style={inputStyle} />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" required value={formData.confirmPassword} onChange={handleChange} style={inputStyle} />

          <button type="submit" style={buttonStyle}>Register</button>
        </form>

        <p style={{ marginTop: "18px", fontSize: "14px" }}>
          Already have an account? <Link to="/login" style={{ color: "goldenrod", fontWeight: "600" }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

// Inline Styles
const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "12px 0",
  border: "1.5px solid #ddd",
  borderRadius: "8px",
  outline: "none",
  fontSize: "14px"
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "goldenrod",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "15px",
  transition: "all 0.3s"
};

export default Register;
