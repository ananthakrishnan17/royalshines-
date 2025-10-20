import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ for redirect after logout
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalIncome: 0, totalProfit: 0 });
  const [salesReport, setSalesReport] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCollection, setNewCollection] = useState({
    title: "",
    img: "",
    category: "",
    price: "",
    quantity: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/contacts")
      .then(res => setContacts(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:5000/api/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:5000/api/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:5000/api/admin/stats")
      .then(res => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch(err => console.error(err));

    fetchSalesReport();
  }, []);

  const fetchSalesReport = () => {
    axios.get(`http://localhost:5000/api/admin/sales-report?period=${reportPeriod}`)
      .then(res => {
        if (res.data.success) {
          setSalesReport(res.data.data);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSalesReport();
  }, [reportPeriod]);

  const handleLogout = () => {
    localStorage.removeItem("user"); // clear user data
    navigate("/login"); // redirect to login page
  };

  const handleAddCollection = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/collections", newCollection);
      if (res.data.success) {
        alert("Collection added successfully!");
        setNewCollection({ title: "", img: "", category: "", price: "", quantity: "" });
        setShowAddForm(false);
      } else {
        alert(res.data.message || "Failed to add collection");
      }
    } catch (error) {
      console.error("Error adding collection:", error);
      alert("Server error while adding collection");
    }
  };

  return (
    <div className="admin-dashboard">

      {/* Top Navbar */}
      <nav className="top-navbar">
        <h1>💎 Royal Shine Jewels</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <h2>💼 Admin Dashboard</h2>
        <p>Welcome, Admin! Manage users, orders, and messages.</p>
      </header>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card users-card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="card contacts-card">
          <h3>Total Messages</h3>
          <p>{contacts.length}</p>
        </div>
        <div className="card orders-card">
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="card income-card">
          <h3>Total Income</h3>
          <p>₹{stats.totalIncome}</p>
        </div>
        <div className="card profit-card">
          <h3>Total Profit</h3>
          <p>₹{stats.totalProfit}</p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Registered Users */}
        <section className="dashboard-section">
          <h3>👥 Registered Users</h3>
          {users.length > 0 ? (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => (
                    <tr key={u.id}>
                      <td>{index + 1}</td>
                      <td>{u.fullname}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No registered users found.</p>}
        </section>

        {/* Contact Messages */}
        <section className="dashboard-section">
          <h3>📩 Contact Messages</h3>
          {contacts.length > 0 ? (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c, index) => (
                    <tr key={c.id}>
                      <td>{index + 1}</td>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.subject}</td>
                      <td>{c.message}</td>
                      <td>{new Date(c.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No contact messages found.</p>}
        </section>

        {/* Collections Management */}
        <section className="dashboard-section">
          <h3>💎 Manage Collections</h3>
          <button className="add-collection-btn" onClick={() => navigate("/collections")}>
            Go to Collections
          </button>
        </section>

        {/* Orders */}
        <section className="dashboard-section">
          <h3>🛒 Orders</h3>
          {orders.length > 0 ? (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Products</th>
                    <th>Total Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, index) => (
                    <tr key={o.id}>
                      <td>{index + 1}</td>
                      <td>{o.order_id}</td>
                      <td>{o.user_name}</td>
                      <td>{o.products.join(", ")}</td>
                      <td>${o.total_amount}</td>
                      <td>{new Date(o.created_at).toLocaleString()}</td>
                      <td>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No orders found.</p>}
        </section>

        {/* Sales Report */}
        <section className="dashboard-section">
          <h3>📊 Sales Report</h3>
          <div className="report-filter">
            <label htmlFor="period">Period: </label>
            <select id="period" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          {salesReport.length > 0 ? (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Period</th>
                    <th>Total Sales</th>
                    <th>Order Count</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.map((report, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{report.period}</td>
                      <td>₹{report.total_sales}</td>
                      <td>{report.order_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No sales data found for the selected period.</p>}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
