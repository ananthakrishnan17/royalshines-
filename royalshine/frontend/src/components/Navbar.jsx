import React, { useEffect, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { cart } = useContext(CartContext);
  const [user, setUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const storedAdminEmail = localStorage.getItem("adminEmail");
    if (storedAdminEmail) setAdminEmail(storedAdminEmail);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    setUser(null);
    setAdminEmail(null);
    navigate("/login");
  };

  // ✅ When user name clicked → go to dashboard
  const handleUserClick = () => {
    navigate("/user-dashboard");
  };

  // ✅ When admin name clicked → go to admin dashboard
  const handleAdminClick = () => {
    navigate("/admin-dashboard");
  };

  return (
    <header className="navbar">
      <div className="logo" onClick={() => navigate("/")}>💎 Royal Shine</div>

      <nav>
        <ul>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/collections">Collections</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>

          {!user && !adminEmail ? (
            <li><NavLink to="/login">Login</NavLink></li>
          ) : (
            <>
              {/* 👇 Clickable user name */}
              {user && (
                <li>
                  <span className="user-name" onClick={handleUserClick}>
                    👤 Hi, {user.fullname}
                  </span>
                </li>
              )}
              {/* 👇 Clickable admin name */}
              {adminEmail && (
                <li>
                  <span className="admin-name" onClick={handleAdminClick}>
                    👑 Admin: {adminEmail}
                  </span>
                </li>
              )}
              <li><button onClick={handleLogout}>Logout</button></li>
              {user && (
                <>
                  <li><NavLink to="/wishlist">Wishlist</NavLink></li>
                  <li>
                    <NavLink to="/cart">
                      Cart 🛒
                      {cart.length > 0 && (
                        <span className="cart-count">{cart.length}</span>
                      )}
                    </NavLink>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
