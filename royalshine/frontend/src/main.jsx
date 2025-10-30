import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext";
import { GoogleOAuthProvider } from "@react-oauth/google"; // ✅ Import GoogleOAuthProvider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID"> {/* ✅ Add this */}
      <CartProvider>
        <App />
      </CartProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
