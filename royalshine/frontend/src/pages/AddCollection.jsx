import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AddCollection.css";

export default function AddCollection() {
  const [newCollection, setNewCollection] = useState({
    title: "",
    img: "",
    category: "",
    price: "",
    quantity: ""
  });
  const [collections, setCollections] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [updatedCollection, setUpdatedCollection] = useState({
    title: "",
    img: "",
    category: "",
    price: "",
    quantity: ""
  });
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem("adminToken") === "admin_logged_in";

  if (!isAdmin) {
    navigate("/collections");
    return null;
  }

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/collections");
      if (res.data.success) {
        setCollections(res.data.collections);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      alert("Server error while fetching collections");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/collections", newCollection);
      if (res.data.success) {
        alert("Collection added successfully!");
        setNewCollection({ title: "", img: "", category: "", price: "", quantity: "" });
        fetchCollections();
      } else {
        alert(res.data.message || "Failed to add collection");
      }
    } catch (error) {
      console.error("Error adding collection:", error);
      alert("Server error while adding collection");
    }
  };

  const handleChange = (e) => {
    setNewCollection({ ...newCollection, [e.target.name]: e.target.value });
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setUpdatedCollection({
      title: item.title,
      img: item.img,
      category: item.category,
      price: item.price,
      quantity: item.quantity
    });
  };

  const handleUpdateCollection = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/collections/${editingItem.id}`, updatedCollection);
      if (res.data.success) {
        alert("Collection updated successfully!");
        setEditingItem(null);
        setUpdatedCollection({ title: "", img: "", category: "", price: "", quantity: "" });
        fetchCollections();
      } else {
        alert(res.data.message || "Failed to update collection");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      alert("Server error while updating collection");
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/collections/${id}`);
        if (res.data.success) {
          alert("Collection deleted successfully!");
          fetchCollections();
        } else {
          alert(res.data.message || "Failed to delete collection");
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
        alert("Server error while deleting collection");
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="add-collection-page">
        <h1>Manage Collections</h1>

        {/* Add New Collection Form */}
        <form onSubmit={handleSubmit} className="add-collection-form">
          <h2>Add New Collection</h2>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={newCollection.title}
            onChange={handleChange}
            required
          />

          <label>Image URL:</label>
          <input
            type="text"
            name="img"
            value={newCollection.img}
            onChange={handleChange}
          />

          <label>Category:</label>
          <select
            name="category"
            value={newCollection.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="necklace">Necklace</option>
            <option value="ring">Ring</option>
            <option value="bracelet">Bracelet</option>
            <option value="earring">Earring</option>
            <option value="crown">Crown</option>
          </select>

          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={newCollection.price}
            onChange={handleChange}
            required
          />

          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={newCollection.quantity}
            onChange={handleChange}
            required
          />

          <button type="submit">Add Collection</button>
        </form>

        {/* Existing Collections List */}
        <div className="collections-list">
          <h2>Existing Collections</h2>
          {collections.length > 0 ? (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>₹{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <button onClick={() => handleEditItem(item)}>Edit</button>
                        <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No collections found.</p>
          )}
        </div>

        {/* Edit Form Overlay */}
        {editingItem && (
          <div className="edit-form-overlay">
            <form className="edit-collection-form" onSubmit={handleUpdateCollection}>
              <h3>Edit Collection</h3>
              <label>Title:</label>
              <input
                type="text"
                value={updatedCollection.title}
                onChange={(e) => setUpdatedCollection({...updatedCollection, title: e.target.value})}
                required
              />
              <label>Image URL:</label>
              <input
                type="text"
                value={updatedCollection.img}
                onChange={(e) => setUpdatedCollection({...updatedCollection, img: e.target.value})}
              />
              <label>Category:</label>
              <select
                value={updatedCollection.category}
                onChange={(e) => setUpdatedCollection({...updatedCollection, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                <option value="necklace">Necklace</option>
                <option value="ring">Ring</option>
                <option value="bracelet">Bracelet</option>
                <option value="earring">Earring</option>
                <option value="crown">Crown</option>
              </select>
              <label>Price:</label>
              <input
                type="number"
                value={updatedCollection.price}
                onChange={(e) => setUpdatedCollection({...updatedCollection, price: e.target.value})}
                required
              />
              <label>Quantity:</label>
              <input
                type="number"
                value={updatedCollection.quantity}
                onChange={(e) => setUpdatedCollection({...updatedCollection, quantity: e.target.value})}
                required
              />
              <div className="edit-buttons">
                <button type="submit">Update</button>
                <button type="button" onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <button type="button" onClick={() => navigate("/collections")}>Back to Collections</button>
      </div>
    </div>
  );
}
