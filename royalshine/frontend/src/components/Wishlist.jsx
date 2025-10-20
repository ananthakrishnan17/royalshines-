// frontend/src/components/Wishlist.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "../pages/UserDashboard.css"; // Reuse existing dashboard styles

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchWishlist = () => {
    axios
      .get("http://localhost:5000/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) setWishlist(res.data.wishlist);
      })
      .catch((err) => {
        console.error("❌ Error fetching wishlist:", err);
        alert("Failed to fetch wishlist");
      })
      .finally(() => setLoading(false));
  };

  const handleRemoveFromWishlist = (productId) => {
    axios
      .delete(`http://localhost:5000/api/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          alert("Removed from wishlist");
          fetchWishlist(); // Refresh the wishlist
        } else {
          alert("Failed to remove item");
        }
      })
      .catch((err) => {
        console.error("❌ Error removing from wishlist:", err);
        alert("Failed to remove item");
      });
  };

  const handleAddToCart = (item) => {
    // Convert wishlist item to cart item format
    const cartItem = {
      id: item.product_id,
      title: item.product_name,
      img: item.product_image,
      price: 0, // Price not stored in wishlist, set to 0 or fetch from collections
      category: item.product_category
    };
    addToCart(cartItem);
  };

  useEffect(() => {
    if (!user || !token) {
      alert("❌ Please login first!");
      navigate("/login");
      return;
    }

    fetchWishlist();
  }, [navigate, token, user]);

  if (loading) return <h3>Loading your wishlist...</h3>;

  return (
    <div className="user-dashboard">
      <nav className="top-navbar">
        <h1>💎 Royal Shine Jewels</h1>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </nav>

      <header className="dashboard-header">
        <h2>💖 {user.fullname}'s Wishlist</h2>
        <p>Email: {user.email} | Phone: {user.phone}</p>
      </header>

      <section className="dashboard-section">
        {wishlist.length === 0 ? (
          <p className="empty-msg">No items added yet — go add something sparkly ✨</p>
        ) : (
          <div className="wishlist-container">
            {wishlist.map((item) => (
              <div key={item.id} className="wishlist-item">
                <img
                  src={item.product_image || "/images/default.png"}
                  alt={item.product_name}
                />
                <h3>{item.product_name}</h3>
                <p>Category: {item.product_category || "N/A"}</p>
                <div className="wishlist-item-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveFromWishlist(item.product_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </section>

      <section className="dashboard-actions">
        <button onClick={() => navigate("/cart")} className="btn-primary">
          Go to Cart
        </button>
        <button onClick={() => navigate("/collections")} className="btn-primary">
          Browse Collections
        </button>
        <button onClick={() => navigate("/contact")} className="btn-secondary">
          Contact Us
        </button>
      </section>

      <footer className="dashboard-footer">
        <p>© 2025 Royal Shine Jewels. Crafted with ❤️ in Tirunelveli.</p>
      </footer>
    </div>
  );
};

export default Wishlist;
