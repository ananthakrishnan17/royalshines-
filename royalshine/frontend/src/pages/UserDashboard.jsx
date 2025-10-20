import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) {
      alert("❌ Please login first!");
      navigate("/login");
      return;
    }

    // Fetch orders for this user
    axios.get(`http://localhost:5000/api/orders/user/${user.id}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));

    // Fetch wishlist for this user
    axios.get("http://localhost:5000/api/wishlist", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.data.success) setWishlist(res.data.wishlist);
      })
      .catch(err => console.error(err));
  }, [navigate, user, token]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="user-dashboard">
      <nav className="top-navbar">
        <h1>💎 Royal Shine Jewels</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      <header className="dashboard-header">
        <h2>Welcome, {user?.fullname || "Guest"} 👋</h2>
        <p>Email: {user?.email} | Phone: {user?.phone}</p>
      </header>

      <div className="summary-cards">
        <div className="card orders-card">
          <h3>Total Orders</h3>
          <p>{orders.length}</p>
        </div>
        <div className="card wishlist-card">
          <h3>Wishlist Items</h3>
          <p>{wishlist.length}</p>
        </div>
      </div>

      <section className="dashboard-section">
        <h3>💖 Your Wishlist</h3>
        {wishlist.length > 0 ? (
          <div className="wishlist-items">
            {wishlist.map((item) => (
              <div key={item.id} className="wishlist-item">
                <img src={item.product_image} alt={item.product_name} />
                <h4>{item.product_name}</h4>
                <p>Category: {item.product_category}</p>
              </div>
            ))}
          </div>
        ) : <p className="empty-msg">No items added yet.</p>}
      </section>

      <section className="dashboard-actions">
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

export default UserDashboard;
