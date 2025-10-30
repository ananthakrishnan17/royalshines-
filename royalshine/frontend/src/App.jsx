import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Collections from "./pages/Collections.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Wishlist from "./components/Wishlist.jsx"; 
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Payment from "./pages/Payment.jsx";
import AddCollection from "./pages/AddCollection.jsx"; // ✅ Already imported
import OrderHistory from "./pages/OrderHistory.jsx"; // ✅ New import for Order History
import Feedback from "./pages/Feedback.jsx"; // ✅ New import for Feedback Page
import OrdersManagement from "./pages/OrdersManagement.jsx"; // ✅ New import for Orders Management

function App() {
  return (
    <Router>
      <Routes>
        {/* Main pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />

        {/* Wishlist and Cart */}
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />

        {/* ✅ Add New Collection Page (Correctly implemented) */}
        <Route path="/add-collection" element={<AddCollection />} />

        {/* ✅ New Order History Page */}
        <Route path="/order-history" element={<OrderHistory />} />

        {/* ✅ New Feedback Page */}
        <Route path="/feedback" element={<Feedback />} />

        {/* ✅ New Orders Management Page */}
        <Route path="/admin/orders-management" element={<OrdersManagement />} />
      </Routes>
    </Router>
  );
}

export default App;