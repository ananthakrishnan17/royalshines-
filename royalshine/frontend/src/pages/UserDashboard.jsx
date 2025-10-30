import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import "./UserDashboard.css";

const UserDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    // State to hold the full user object including details like phone
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("user")));

    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Extract basic user details for checks
    const userId = userData?.id;
    const userEmail = userData?.email;
    const userFullname = userData?.fullname;


    // Helper function to fetch full user details (e.g., phone) if not in localStorage
    const fetchUserDetails = async (id, token) => {
        try {
            // NOTE: You need a new GET /api/auth/details/:id route in auth.js for this to work
            const response = await axios.get(`http://localhost:5000/api/auth/details/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                // Update local state with full details (including phone)
                setUserData(response.data.user);
            }
        } catch (err) {
            console.error("Failed to fetch user details:", err);
        }
    };


    useEffect(() => {
        if (!userId || !token) {
            alert("❌ Please login first!");
            navigate("/login");
            return;
        }

        // Check if phone number is present in stored user data, if not, fetch details
        if (!userData.phone) {
             fetchUserDetails(userId, token);
        }

        // Fetch orders for this user
        axios
            .get(`http://localhost:5000/api/orders/user/${userId}`)
            .then((res) => setOrders(res.data))
            .catch((err) => console.error("Error fetching orders:", err));

        // Fetch wishlist for this user
        axios
            .get("http://localhost:5000/api/wishlist", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (res.data.success) setWishlist(res.data.wishlist);
            })
            .catch((err) => console.error("Error fetching wishlist:", err));
            
    }, [navigate, userId, token, userData.phone]); // Dependency added for phone check

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    // ✅ Updated Delete Account Handler with improved error handling
    const handleDeleteAccount = async () => {
        if (
            window.confirm(
                "⚠️ Are you sure you want to delete your account? This will permanently remove your orders, wishlist, and account details."
            )
        ) {
            try {
                const response = await axios.delete(
                    `http://localhost:5000/api/auth/users/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    alert("✅ Account deleted permanently.");
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    navigate("/");
                } else {
                    // This handles messages from the backend (e.g., "User not found")
                    alert(response.data.message || "❌ Failed to delete account.");
                }
            } catch (error) {
                console.error("❌ Error deleting account:", error);
                
                // --- IMPROVED ERROR MESSAGE FOR CLIENT ---
                let errorMessage = "Server error while deleting account. Please try again later.";
                
                if (error.response) {
                    // This logs the actual status code returned by the server
                    console.error("Server Response Status:", error.response.status); 
                    
                    if (error.response.status === 403) {
                        errorMessage = "Session expired or unauthorized. Please log in again.";
                    } else if (error.response.data && error.response.data.message) {
                        // Use the specific error message from the backend if available
                        errorMessage = error.response.data.message; 
                    }
                }
                alert(errorMessage);
            }
        }
    };

    return (
        <div className="user-dashboard">
            <nav className="top-navbar">
                <h1>💎 Royal Shine Jewels</h1>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </nav>

            <header className="dashboard-header">
                <h2>Welcome, {userFullname || "Guest"} 👋</h2>
                {/* Use userData for phone, which is updated either by localStorage or fetch */}
                <p>Email: {userEmail} | Phone: {userData?.phone || "N/A"}</p> 
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
                ) : (
                    <p className="empty-msg">No items added yet.</p>
                )}
            </section>

            <section className="dashboard-actions">
                <button
                    onClick={() => navigate("/collections")}
                    className="btn-primary"
                >
                    Browse Collections
                </button>
                <button onClick={() => navigate("/order-history")} className="btn-secondary">
                    My Orders
                </button>
                <button onClick={() => navigate("/contact")} className="btn-secondary">
                    Contact Us
                </button>
                <button onClick={() => navigate("/feedback")} className="btn-secondary">
                    Give Feedback
                </button>
                <button onClick={handleDeleteAccount} className="btn-danger">
                    Delete Account
                </button>
            </section>

            <Footer />
        </div>
    );
};

export default UserDashboard;