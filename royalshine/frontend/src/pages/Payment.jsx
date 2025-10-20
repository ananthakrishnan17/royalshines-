import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Payment.css";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { shippingAddress, paymentMethod, totalPrice, cart } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardType: ""
  });
  const [upiDetails, setUpiDetails] = useState({
    upiId: "",
    upiApp: ""
  });
  const [payAdvance, setPayAdvance] = useState(false);
  const advanceAmount = totalPrice >= 10000 ? Math.floor(totalPrice / 10) : 1000;

  useEffect(() => {
    if (!shippingAddress || !paymentMethod || !totalPrice) {
      alert("Invalid payment data. Redirecting to checkout.");
      navigate("/checkout");
    }
  }, [shippingAddress, paymentMethod, totalPrice, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let cardType = "";
    if (name === "cardNumber") {
      const number = value.replace(/\s/g, "");
      if (number.startsWith("4")) cardType = "Visa";
      else if (number.startsWith("5") || number.startsWith("2")) cardType = "MasterCard";
      else if (number.startsWith("3")) cardType = "American Express";
      else cardType = "";
    }
    setCardDetails(prev => ({ ...prev, [name]: value, cardType }));
  };

  const handleUpiInputChange = (e) => {
    const { name, value } = e.target;
    setUpiDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (paymentMethod === "cash") {
      if (payAdvance) {
        // Pay advance ₹1000 via Razorpay, then place order
        setLoading(true);
        try {
          const res = await axios.post("http://localhost:5000/api/orders/create-razorpay-order", {
            amount: advanceAmount * 100, // Advance amount in paisa
            currency: "INR"
          });

          const { id: orderId, amount, currency } = res.data;

          const options = {
            key: "YOUR_RAZORPAY_KEY_ID",
            amount,
            currency,
            name: "Royal Shine",
            description: "Advance Payment for Jewelry Purchase",
            order_id: orderId,
            handler: async (response) => {
              // Advance payment successful, now place the order
              try {
                const verifyRes = await axios.post("http://localhost:5000/api/orders/verify-payment", {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  shippingAddress,
                  paymentMethod: "cash_advance",
                  advanceAmount: advanceAmount,
                  totalAmount: totalPrice
                }, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });

                if (verifyRes.data.success) {
                  alert(`Advance payment successful! Order placed. Order ID: ${verifyRes.data.orderId}. Pay remaining ₹${totalPrice - advanceAmount} on delivery.`);
                  navigate("/user-dashboard");
                } else {
                  alert("Order placement failed after advance payment.");
                }
              } catch (error) {
                console.error("Order placement error:", error);
                alert("Failed to place order after advance payment.");
              }
            },
            prefill: {
              name: userDetails.name || "",
              email: userDetails.email || "",
              contact: userDetails.phone || ""
            },
            theme: {
              color: "#3399cc"
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (error) {
          console.error("Advance payment error:", error);
          alert("Failed to initiate advance payment.");
        } finally {
          setLoading(false);
        }
      } else {
        // For cash on delivery, directly place the order
        try {
          const res = await axios.post(
            "http://localhost:5000/api/orders",
            { shippingAddress, paymentMethod },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          if (res.data.success) {
            alert(`Order placed successfully! Order ID: ${res.data.orderId}`);
            navigate("/user-dashboard");
          } else {
            alert(res.data.message || "Failed to place order");
          }
        } catch (error) {
          console.error("Error placing order:", error);
          alert("Server error while placing order");
        }
      }
      return;
    }

    if (!userDetails.name || !userDetails.email || !userDetails.phone) {
      alert("Please fill in all details.");
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order
      const res = await axios.post("http://localhost:5000/api/orders/create-razorpay-order", {
        amount: totalPrice * 100, // Razorpay expects amount in paisa
        currency: "INR"
      });

      const { id: orderId, amount, currency } = res.data;

      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay Key ID
        amount,
        currency,
        name: "Royal Shine",
        description: "Jewelry Purchase",
        order_id: orderId,
        handler: async (response) => {
          // Payment successful
          try {
            const verifyRes = await axios.post("http://localhost:5000/api/orders/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress,
              paymentMethod,
              userDetails
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (verifyRes.data.success) {
              alert(`Payment successful! Order ID: ${verifyRes.data.orderId}`);
              navigate("/user-dashboard");
            } else {
              alert("Payment verification failed.");
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-container">
        <h2>Payment</h2>
        <div className="payment-summary">
          <p><strong>Total Amount:</strong> ₹{totalPrice}</p>
          <p><strong>Shipping Address:</strong> {shippingAddress}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>
          <div className="selected-collections">
            <h4>Selected Collections:</h4>
            <ul>
              {cart && cart.map(item => (
                <li key={item.id}>{item.title} (Qty: {item.quantity})</li>
              ))}
            </ul>
          </div>
        </div>
        <form onSubmit={handlePayment} className="user-details-form">
          {(paymentMethod === "card" || paymentMethod === "upi") && (
            <>
              <h3>Enter Your Details</h3>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userDetails.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userDetails.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}
          {paymentMethod === "cash" && (
            <>
              <h3>Cash on Delivery</h3>
              <p>You will pay ₹{totalPrice} in cash when your order is delivered.</p>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={payAdvance}
                    onChange={(e) => setPayAdvance(e.target.checked)}
                  />
                  Pay Advance ₹{advanceAmount} (Remaining ₹{totalPrice - advanceAmount} on delivery)
                </label>
              </div>
              {payAdvance && (
                <>
                  <h4>Advance UPI Details</h4>
                  <div className="form-group">
                    <label htmlFor="advanceUpiId">UPI ID</label>
                    <input
                      type="text"
                      id="advanceUpiId"
                      name="advanceUpiId"
                      value={upiDetails.advanceUpiId || ""}
                      onChange={handleUpiInputChange}
                      placeholder="example@upi"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="advanceUpiApp">UPI App</label>
                    <select
                      id="advanceUpiApp"
                      name="advanceUpiApp"
                      value={upiDetails.advanceUpiApp || ""}
                      onChange={handleUpiInputChange}
                      required
                    >
                      <option value="">Select UPI App</option>
                      <option value="gpay">Google Pay</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="paytm">Paytm</option>
                      <option value="amazonpay">Amazon Pay</option>
                      <option value="bhim">BHIM UPI</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}
            </>
          )}
          {paymentMethod === "card" && (
            <>
              <h3>Card Details</h3>
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleCardInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
                {cardDetails.cardType && <p>Card Type: {cardDetails.cardType}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="cardHolderName">Cardholder Name</label>
                <input
                  type="text"
                  id="cardHolderName"
                  name="cardHolderName"
                  value={cardDetails.cardHolderName || ""}
                  onChange={handleCardInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleCardInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardInputChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="billingAddress">Billing Address</label>
                <textarea
                  id="billingAddress"
                  name="billingAddress"
                  value={cardDetails.billingAddress || ""}
                  onChange={handleCardInputChange}
                  placeholder="Enter billing address"
                  rows="3"
                  required
                />
              </div>
            </>
          )}
          {paymentMethod === "upi" && (
            <>
              <h3>UPI Details</h3>
              <div className="form-group">
                <label htmlFor="upiId">UPI ID</label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  value={upiDetails.upiId}
                  onChange={handleUpiInputChange}
                  placeholder="example@upi"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="upiApp">UPI App</label>
                <select
                  id="upiApp"
                  name="upiApp"
                  value={upiDetails.upiApp}
                  onChange={handleUpiInputChange}
                  required
                >
                  <option value="">Select UPI App</option>
                  <option value="gpay">Google Pay</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="paytm">Paytm</option>
                  <option value="amazonpay">Amazon Pay</option>
                  <option value="bhim">BHIM UPI</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}
          <button type="submit" className="btn-pay" disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
