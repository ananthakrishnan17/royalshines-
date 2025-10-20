import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-container">
        <div className="cart-header">
          <h2>Your Cart</h2>
        </div>
        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.img} alt={item.title} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h3 className="cart-item-title">{item.title}</h3>
                      <p className="cart-item-price">₹{item.price}</p>
                      <div className="cart-item-quantity">
                        <label className="quantity-label">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="quantity-input"
                        />
                      </div>
                      <div className="cart-item-actions">
                        <button onClick={() => removeFromCart(item.id)} className="btn-remove">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <p className="cart-total">Total: ₹{totalPrice}</p>
                <button className="btn-checkout" onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
