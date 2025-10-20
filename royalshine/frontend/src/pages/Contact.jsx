import React, { useState } from "react";
import "./Contact.css";
import Navbar from "../components/Navbar";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      alert(result.message || "Message sent successfully!");

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      alert("Failed to send message. Please try again.");
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar />

      {/* Contact Section */}
      <section className="contact-section">
        <h1>✨ Get in Touch With Us ✨</h1>

        <div className="contact-container">
          {/* Contact Info */}
          <div className="contact-info">
            <h2>📍 Visit Us</h2>
            <p><strong>Royal Shine Jewels</strong></p>
            <p>Near Nellaiappar Temple, Tirunelveli - 627006</p>
            <p>📞 +91 91509 21153</p>
            <p>📧 support@royalshinejewels.com</p>
            <p>🕒 Mon - Sat: 10 AM to 8 PM</p>
          </div>

          {/* Contact Form */}
          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                id="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                id="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                id="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
              <textarea
                id="message"
                rows="5"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <button type="submit">📨 Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.198682217051!2d77.6861905!3d8.7274692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04112357178cbd%3A0x6835e7fed35e842e!2sAL%20Avathar%20Jewellers!5e0!3m2!1sen!2sin!4v1690000000000"
        width="100%"
        height="350"
        style={{ border: "0" }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Royal Shine Location"
      ></iframe>

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

export default Contact;
