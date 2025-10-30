import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import "./Collections.css";

export default function Collections() {
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCollection, setNewCollection] = useState({
    title: "",
    img: "",
    category: "",
    price: "",
    quantity: ""
  });
  const [editingItem, setEditingItem] = useState(null);
  const [updatedCollection, setUpdatedCollection] = useState({
    title: "",
    img: "",
    category: "",
    price: "",
    quantity: ""
  });
  const [zoomedImage, setZoomedImage] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const isAdmin = localStorage.getItem("adminToken") === "admin_logged_in";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchCollections();

    // If user logged in after selecting cart item
    const pendingCartItem = localStorage.getItem("pendingCartItem");
    if (pendingCartItem && token && user) {
      const item = JSON.parse(pendingCartItem);
      addToCart(item);
      localStorage.removeItem("pendingCartItem");
    }

    // If user logged in after selecting wishlist item
    const pendingWishlistItem = localStorage.getItem("pendingWishlistItem");
    if (pendingWishlistItem && token && user) {
      const item = JSON.parse(pendingWishlistItem);
      handleAddToWishlist(item);
      localStorage.removeItem("pendingWishlistItem");
    }
  }, [token, user]);

  // 🔹 Fetch all collections from database
  const fetchCollections = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/collections");
      if (res.data.success) {
        setCollections(res.data.collections);
        setFilteredCollections(res.data.collections);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Filter by category
  const handleFilterCategory = (category) => {
    setActiveCategory(category);
    filterCollections(searchTerm, category);
  };

  // 🔹 Search and filter combined
  const filterCollections = (term, category) => {
    let filtered = collections.filter(item =>
      item.title.toLowerCase().includes(term.toLowerCase())
    );
    if (category !== "all") filtered = filtered.filter(item => item.category === category);
    setFilteredCollections(filtered);
  };

  // 🔹 Handle search input
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterCollections(term, activeCategory);
  };

  // 🔹 Handle add to cart
  const handleAddToCart = (item) => {
    if (!token || !user) {
      localStorage.setItem("pendingCartItem", JSON.stringify(item));
      alert("❌ Please login first!");
      navigate("/login");
      return;
    }
    addToCart(item);
  };

  // 🔹 Handle add to wishlist
  const handleAddToWishlist = async (item) => {
    if (!token || !user) {
      localStorage.setItem("pendingWishlistItem", JSON.stringify(item));
      alert("❌ Please login first!");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/wishlist/add",
        { productId: item.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("✅ Added to wishlist!");
      } else {
        alert(res.data.message || "❌ Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Server error while adding to wishlist");
    }
  };



  // 🔹 Add new collection
  const handleAddCollection = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/collections", newCollection);
      if (res.data.success) {
        alert("✅ Collection added successfully!");
        setNewCollection({ title: "", img: "", category: "", price: "", quantity: "" });
        setShowAddForm(false);
        fetchCollections();
      } else {
        alert(res.data.message || "❌ Failed to add collection");
      }
    } catch (error) {
      console.error("Error adding collection:", error);
      alert("Server error while adding collection");
    }
  };

  // 🔹 Edit collection
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

  // 🔹 Update collection
  const handleUpdateCollection = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/collections/${editingItem.id}`, updatedCollection);
      if (res.data.success) {
        alert("✅ Collection updated successfully!");
        setEditingItem(null);
        setUpdatedCollection({ title: "", img: "", category: "", price: "", quantity: "" });
        fetchCollections();
      } else {
        alert(res.data.message || "❌ Failed to update collection");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      alert("Server error while updating collection");
    }
  };

  // 🔹 Delete collection
  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/collections/${id}`);
        if (res.data.success) {
          alert("🗑️ Collection deleted successfully!");
          fetchCollections();
        } else {
          alert(res.data.message || "❌ Failed to delete collection");
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
        alert("Server error while deleting collection");
      }
    }
  };

  // 🔹 UI render
  return (
    <div>
      <Navbar />

      <div className="collections-header">
        {isAdmin && <h2 className="admin-welcome">Welcome, Admin</h2>}
        <h1>💎 Royal Shine Jewels Collection</h1>
        <input
          type="text"
          placeholder="🔍 Search jewellery..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className="category-chips">
          {["all", "necklace", "ring", "bracelet", "earring", "crown", "bangle"].map(category => (
            <button
              key={category}
              className={activeCategory === category ? "chip active" : "chip"}
              onClick={() => handleFilterCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button className="add-collection-btn" onClick={() => setShowAddForm(!showAddForm)}>
            Add Collection
          </button>
        )}
      </div>

      {loading ? (
        <p className="loading-text">Loading collections...</p>
      ) : (
        <div className="collection-grid">
          {filteredCollections.length > 0 ? (
            filteredCollections.map(item => (
              <div key={item.id} className="item-card">
                <img src={item.img} alt={item.title} onClick={() => setZoomedImage(item.img)} />
                <h3>{item.title}</h3>
                <p>₹{item.price}</p>
                <p className="quantity">Stock: {item.quantity}</p>
                {!localStorage.getItem("adminToken") && (
                  <div className="item-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="add-to-wishlist-btn"
                      onClick={() => handleAddToWishlist(item)}
                    >
                      ❤️ Wishlist
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No collections found.</p>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="admin-add-section">
          <button className="add-collection-btn" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add New Collection"}
          </button>

          {showAddForm && (
            <div className="edit-form-overlay">
              <form className="add-collection-form" onSubmit={handleAddCollection}>
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
                  <button type="submit">Add Collection</button>
                  <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {editingItem && (
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
                  <button type="button" onClick={() => setEditingItem(null)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {zoomedImage && (
        <div className="zoom-overlay active" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Zoomed" />
        </div>
      )}
    </div>
  );
}
