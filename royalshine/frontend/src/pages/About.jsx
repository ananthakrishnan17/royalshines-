import React from "react";
import Navbar from "../components/Navbar"; // ✅ Import Navbar
import "./About.css";

function About() {
  return (
    <div>
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
      <section className="about-hero">
        <h1>About Royal Shine</h1>
        <p>
          Since 1999, Royal Shine Jewels has captured hearts with its exceptional
          craftsmanship and timeless designs. Discover the legacy of elegance we
          proudly carry forward.
        </p>
      </section>

      {/* Legacy Section */}
      <section className="about-container">
        <div className="about-text">
          <h2>Our Legacy</h2>
          <p>
            <strong>Royal Shine Jewels</strong> was founded with a vision to bring
            brilliance and trust into every home. From traditional gold ornaments
            to modern diamond masterpieces, every piece we create tells a story of
            love and celebration.
          </p>
          <p>
            Our team of skilled artisans ensures each design blends rich tradition
            with modern elegance — perfect for weddings, gifts, or daily wear.
          </p>
        </div>
        <div className="about-image">
          <img
            src="/images/ChatGPT Image Jul 14, 2025, 08_31_52 PM.png"
            alt="Inside Our Store"
          />
        </div>
      </section>

      {/* Promise Section */}
      <section className="vision-section">
        <h2>Our Promise</h2>
        <div className="vision-cards">
          <div className="vision-card">
            <h3>🔒 Certified Gold</h3>
            <p>BIS Hallmarked jewelry with guaranteed purity & quality.</p>
          </div>
          <div className="vision-card">
            <h3>❤️ 20,000+ Happy Customers</h3>
            <p>Trusted by families across Tamil Nadu and beyond.</p>
          </div>
          <div className="vision-card">
            <h3>🛡️ Lifetime Care</h3>
            <p>Free polishing & repair services on selected collections.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p>📍 Near Nellaiappar Temple, Tirunelveli | 📞 +91 9150921153</p>
          <p>© 2025 Royal Shine Jewels. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default About;
