import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {
  const { cart, totalPrice } = useContext(CartContext);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const address = `Lat: ${latitude}, Lng: ${longitude}`;
          setShippingAddress(address);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location. Please enter your address manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleProceedToPay = () => {
    if (!token) {
      alert("Please login to place an order.");
      navigate("/login");
      return;
    }
    if (!shippingAddress.trim()) {
      alert("Please enter a shipping address.");
      return;
    }

    // Navigate to payment page with order data
    navigate("/payment", {
      state: {
        shippingAddress,
        paymentMethod,
        totalPrice,
        cart
      }
    });
  };

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>Checkout</h2>
        </div>
        <div className="checkout-content">
          {cart.length === 0 ? (
            <div className="empty-checkout">
              <p>Your cart is empty. <a href="/collections">Go to Collections</a></p>
            </div>
          ) : (
            <>
              <div className="checkout-items">
                {cart.map(item => (
                  <div key={item.id} className="checkout-item">
                    <img src={item.img} alt={item.title} className="checkout-item-image" />
                    <div className="checkout-item-details">
                      <h4 className="checkout-item-title">{item.title}</h4>
                      <p className="checkout-item-price">₹{item.price} x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="checkout-summary">
                <div className="checkout-total">
                  Total: ₹{totalPrice}
                </div>
                <button className="btn-back-to-cart" onClick={() => navigate("/cart")}>Back to Cart</button>
              </div>
              <div className="checkout-form">
                <h4>Shipping & Payment</h4>
                <div className="form-group">
                  <label htmlFor="shippingAddress">Shipping Address</label>
                  <input
                    type="text"
                    id="shippingAddress"
                    placeholder="Enter your shipping address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                  <button type="button" className="btn-get-location" onClick={handleGetLocation}>Get Current Location</button>
                </div>
                <div className="form-group">
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>
                <button className="btn-place-order" onClick={handleProceedToPay}>Proceed to Pay</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


