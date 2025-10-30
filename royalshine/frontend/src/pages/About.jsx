import React from "react";
import Navbar from "../components/Navbar"; // ✅ Import Navbar
import Footer from "../components/Footer"; // ✅ Import Footer
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

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <h2>Why Choose Royal Shine?</h2>
        <div className="why-choose-cards">
          <div className="why-choose-card">
            <div className="card-icon">💎</div>
            <h3>Expert Craftsmanship</h3>
            <p>Over 25 years of experience in creating exquisite jewelry pieces with meticulous attention to detail.</p>
          </div>
          <div className="why-choose-card">
            <div className="card-icon">🏆</div>
            <h3>Award-Winning Designs</h3>
            <p>Recognized for innovative designs that blend traditional elegance with contemporary trends.</p>
          </div>
          <div className="why-choose-card">
            <div className="card-icon">🚚</div>
            <h3>Free Home Delivery</h3>
            <p>Complimentary doorstep delivery across Tamil Nadu with secure packaging and insurance.</p>
          </div>
          <div className="why-choose-card">
            <div className="card-icon">💰</div>
            <h3>Best Price Guarantee</h3>
            <p>Competitive pricing with no hidden costs and transparent gold rates updated daily.</p>
          </div>
          <div className="why-choose-card">
            <div className="card-icon">🎨</div>
            <h3>Custom Design Service</h3>
            <p>Personalized jewelry creation service to bring your unique vision to life.</p>
          </div>
          <div className="why-choose-card">
            <div className="card-icon">📞</div>
            <h3>24/7 Support</h3>
            <p>Dedicated customer support available round the clock for all your jewelry needs.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default About;
