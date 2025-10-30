import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ for redirect after logout
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [collections, setCollections] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalIncome: 0, totalProfit: 0 });
  const [salesReport, setSalesReport] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [editingCollection, setEditingCollection] = useState(null);
  const [updatedCollection, setUpdatedCollection] = useState({
    title: "",
    img: "",
    category: "",
    price: "",
    quantity: ""
  });
  const [addingCollection, setAddingCollection] = useState(false);
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

    axios.get("http://localhost:5000/api/collections")
      .then(res => {
        if (res.data.success) {
          setCollections(res.data.collections);
        }
      })
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

  const handleEditCollection = (collection) => {
    setEditingCollection(collection);
    setUpdatedCollection({
      title: collection.title,
      img: collection.img,
      category: collection.category,
      price: collection.price,
      quantity: collection.quantity
    });
  };

  const handleUpdateCollection = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/collections/${editingCollection.id}`, updatedCollection);
      if (res.data.success) {
        alert("✅ Collection updated successfully!");
        setEditingCollection(null);
        setUpdatedCollection({ title: "", img: "", category: "", price: "", quantity: "" });
        // Refresh collections
        axios.get("http://localhost:5000/api/collections")
          .then(res => {
            if (res.data.success) {
              setCollections(res.data.collections);
            }
          })
          .catch(err => console.error(err));
      } else {
        alert(res.data.message || "❌ Failed to update collection");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      alert("Server error while updating collection");
    }
  };

  const handleDeleteCollection = async (id) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/collections/${id}`);
        if (res.data.success) {
          alert("🗑️ Collection deleted successfully!");
          // Refresh collections
          axios.get("http://localhost:5000/api/collections")
            .then(res => {
              if (res.data.success) {
                setCollections(res.data.collections);
              }
            })
            .catch(err => console.error(err));
        } else {
          alert(res.data.message || "❌ Failed to delete collection");
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
        alert("Server error while deleting collection");
      }
    }
  };

  const handleAddCollection = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/collections", newCollection);
      if (res.data.success) {
        alert("✅ Collection added successfully!");
        setAddingCollection(false);
        setNewCollection({ title: "", img: "", category: "", price: "", quantity: "" });
        // Refresh collections
        axios.get("http://localhost:5000/api/collections")
          .then(res => {
            if (res.data.success) {
              setCollections(res.data.collections);
            }
          })
          .catch(err => console.error(err));
      } else {
        alert(res.data.message || "❌ Failed to add collection");
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
        <p>Welcome, <span className="admin-name">Admin</span>! Manage users, orders, and messages.</p>
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
                {users.length > 0 ? (
                  users.map((u, index) => (
                    <tr key={u.id}>
                      <td>{index + 1}</td>
                      <td>{u.fullname || "N/A"}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-msg">No registered users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

        {/* Collections */}
        <section className="dashboard-section">
          <h3>💎 Collections</h3>
          <button className="add-collection-btn" onClick={() => setAddingCollection(true)}>
            Add Collection
          </button>
          <button className="add-collection-btn" onClick={() => navigate("/collections")}>
            Go to Collection Page
          </button>
          {collections.length > 0 ? (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((c, index) => (
                    <tr key={c.id}>
                      <td>{index + 1}</td>
                      <td>{c.title}</td>
                      <td>{c.category}</td>
                      <td>₹{c.price}</td>
                      <td>{c.quantity}</td>
                      <td>
                        <button onClick={() => handleEditCollection(c)}>✏️ Edit</button>
                        <button onClick={() => handleDeleteCollection(c.id)}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No collections found.</p>}
        </section>

        {/* Orders */}
        <section className="dashboard-section">
          <h3>🛒 Orders</h3>
          <button className="manage-orders-btn" onClick={() => navigate("/admin/orders-management")}>
            Manage Orders
          </button>
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
            <button
              className="download-pdf-btn"
              onClick={() => {
                const link = document.createElement('a');
                link.href = `http://localhost:5000/api/admin/sales-report/pdf?period=${reportPeriod}`;
                link.download = `sales-report-${reportPeriod}.pdf`;
                link.click();
              }}
            >
              Download PDF
            </button>
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

      {editingCollection && (
        <div className="edit-form-overlay">
          <form className="edit-collection-form" onSubmit={handleUpdateCollection}>
            <h3>Edit Collection</h3>
            <input
              type="text"
              placeholder="Title"
              value={updatedCollection.title}
              onChange={(e) => setUpdatedCollection({ ...updatedCollection, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={updatedCollection.img}
              onChange={(e) => setUpdatedCollection({ ...updatedCollection, img: e.target.value })}
            />
            <select
              value={updatedCollection.category}
              onChange={(e) => setUpdatedCollection({ ...updatedCollection, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              <option value="necklace">Necklace</option>
              <option value="ring">Ring</option>
              <option value="bracelet">Bracelet</option>
              <option value="earring">Earring</option>
              <option value="crown">Crown</option>
              <option value="bangle">Bangle</option>
            </select>
            <input
              type="number"
              placeholder="Price"
              value={updatedCollection.price}
              onChange={(e) => setUpdatedCollection({ ...updatedCollection, price: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={updatedCollection.quantity}
              onChange={(e) => setUpdatedCollection({ ...updatedCollection, quantity: e.target.value })}
              required
            />
            <div className="edit-buttons">
              <button type="submit">Update</button>
              <button type="button" onClick={() => setEditingCollection(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {addingCollection && (
        <div className="edit-form-overlay">
          <form className="edit-collection-form" onSubmit={handleAddCollection}>
            <h3>Add New Collection</h3>
            <input
              type="text"
              placeholder="Title"
              value={newCollection.title}
              onChange={(e) => setNewCollection({ ...newCollection, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newCollection.img}
              onChange={(e) => setNewCollection({ ...newCollection, img: e.target.value })}
            />
            <select
              value={newCollection.category}
              onChange={(e) => setNewCollection({ ...newCollection, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              <option value="necklace">Necklace</option>
              <option value="ring">Ring</option>
              <option value="bracelet">Bracelet</option>
              <option value="earring">Earring</option>
              <option value="crown">Crown</option>
              <option value="bangle">Bangle</option>
            </select>
            <input
              type="number"
              placeholder="Price"
              value={newCollection.price}
              onChange={(e) => setNewCollection({ ...newCollection, price: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newCollection.quantity}
              onChange={(e) => setNewCollection({ ...newCollection, quantity: e.target.value })}
              required
            />
            <div className="edit-buttons">
              <button type="submit">Add</button>
              <button type="button" onClick={() => setAddingCollection(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
