import "./Home.css";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FestivalOffer from "../components/FestivalOffer";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import { useState, useEffect } from "react";
import axios from "axios";

function Home() {
  const [goldRate, setGoldRate] = useState("Loading...");
  const [silverRate, setSilverRate] = useState("Loading...");

  useEffect(() => {
    const fetchRates = async () => {
      const API_KEY = "goldapi-1s8zsmgp5bpyt-io"; // Your API key
      const USD_TO_INR = 83; // USD to INR conversion
      const GRAMS_IN_OUNCE = 31.1035;

      try {
        // Fetch Gold Rate
        const goldRes = await axios.get("https://www.goldapi-1s8zsmgp5bpyt-io/api/XAU/USD", {
          headers: { "x-access-token": API_KEY, "Content-Type": "application/json" },
        });
        if (goldRes.data?.price) {
          const price = (goldRes.data.price * USD_TO_INR) / GRAMS_IN_OUNCE;
          setGoldRate(`₹${price.toFixed(2)} / gram`);
        } else {
          setGoldRate("Error fetching gold rate");
        }

        // Fetch Silver Rate
        const silverRes = await axios.get("https://www.goldapi.io/api/XAG/USD", {
          headers: { "x-access-token": API_KEY, "Content-Type": "application/json" },
        });
        if (silverRes.data?.price) {
          const price = (silverRes.data.price * USD_TO_INR) / GRAMS_IN_OUNCE;
          setSilverRate(`₹${price.toFixed(2)} / gram`);
        } else {
          setSilverRate("Error fetching silver rate");
        }
      } catch (error) {
        console.error("Error fetching rates:", error);
        setGoldRate("Error fetching data");
        setSilverRate("Error fetching data");
      }
    };

    fetchRates();

    // Optional: Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Luxury That Lasts Forever</h1>
          <p>Experience timeless beauty with handcrafted jewels made just for you.</p>
          <Link to="/collections" className="btn">View Collections</Link>

          {/* Rate Bar */}
          <div className="small-rate-bar">
            <span>💰 Gold: {goldRate}</span>
            <span>🥈 Silver: {silverRate}</span>
          </div>
        </div>
      </section>

      {/* Festival Offer */}
      <FestivalOffer />

      {/* About */}
      <section className="about-preview">
        <h2>Why Choose Royal Shine?</h2>
        <p>
          Celebrating 25+ years of trust, elegance, and unmatched craftsmanship in gold,
          silver, and diamond collections.
        </p>
      </section>

      {/* Products & Collections */}
      <section className="products">
        <h2>Top Picks</h2>
        <div className="product-grid">
          <div className="product-card">
            <img src="/images/download (2).jpg" alt="Gold Ring" />
            <h3>Gold Ring</h3>
            <p>Pure 22K handcrafted ring with royal design.</p>
          </div>
          <div className="product-card">
            <img src="/images/Untitleddesign-2024-05-09T181622.347.webp" alt="Neck Chain" />
            <h3>Neck Chain</h3>
            <p>Daily wear elegance with premium polish finish.</p>
          </div>
          <div className="product-card">
            <img src="/images/download (3).jpg" alt="Diamond Earrings" />
            <h3>Diamond Earrings</h3>
            <p>Certified diamonds with a contemporary twist.</p>
          </div>
        </div>
      </section>

      <section className="collection-category">
        <h2>✨ Signature Bangles</h2>
        <div className="product-grid">
          <div className="product-card">
            <img src="/images/images (1).jpg" alt="Gold Bangle" />
            <h3>Gold Bangle</h3>
            <p>Temple-inspired craftsmanship in every detail.</p>
          </div>
          <div className="product-card">
            <img src="/images/image.png" alt="Gold Bracelet" />
            <h3>Gold Bracelet</h3>
            <p>Minimalist bracelet, perfect for modern style.</p>
          </div>
          <div className="product-card">
            <img src="/images/nkdia11157_z_2.jpg" alt="Diamond Necklace" />
            <h3>Diamond Necklace</h3>
            <p>Grand Kundan design for bridal perfection.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* WhatsApp */}
      <a
        href="https://wa.me/919150921153"
        className="whatsapp-float"
        target="_blank"
        rel="noreferrer"
      >
        <img src="/images/pngimg.com - whatsapp_PNG21.png" width="100px" alt="Chat" />
      </a>

      <button id="backToTop" title="Back to Top">↑</button>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default Home;
