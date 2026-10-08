import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, RefreshCw } from "lucide-react";
import { getWishlist } from "../services/api";
import ProductCard from "../components/ProductCard";

/**
 * Wishlist Page
 * Route: /wishlist
 *
 * Flow:
 * 1. On load, calls GET /wishlist (protected by cookie-based JWT)
 * 2. Renders populated product cards
 * 3. Handles loading, empty, and error states
 * 4. ProductCard handles remove via onWishlistChange — no page refresh needed
 */
function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWishlist();
      const items = data.wishlist || [];
      setWishlist(items);
      setWishlistIds(new Set(items.map((p) => p._id)));
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      if (err?.response?.status === 401) {
        setError("Please log in to view your wishlist.");
      } else {
        setError("Something went wrong. We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Called by ProductCard when remove succeeds — removes from list without refetch
  const handleWishlistChange = (productId, isNowInWishlist) => {
    if (!isNowInWishlist) {
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="wishlist-page-container">
        <div className="loading-container" id="wishlist-loading">
          <div className="spinner" />
          <span className="loading-text">Loading your wishlist...</span>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="wishlist-page-container">
        <div className="products-error-state" id="wishlist-error-state">
          <span>Something went wrong.</span>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            id="wishlist-retry-btn"
            onClick={fetchWishlist}
            style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Empty State ---
  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page-container">
        <div className="products-empty-state" id="wishlist-empty-state">
          <div className="products-empty-icon">
            <Heart size={48} strokeWidth={1.5} style={{ opacity: 0.4 }} />
          </div>
          <h3 className="products-empty-title">Your wishlist is empty</h3>
          <p className="products-empty-subtitle">
            Save products you love and find them here later.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            id="wishlist-browse-btn"
            onClick={() => navigate("/products")}
            style={{ marginTop: "20px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ShoppingBag size={15} />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // --- Wishlist Grid ---
  return (
    <div className="wishlist-page-container">
      {/* Page Header */}
      <div className="products-page-header">
        <div className="products-title-group">
          <Heart size={28} color="var(--brand-accent)" />
          <h1 className="products-page-title">My Wishlist</h1>
        </div>
        <p className="products-page-subtitle">
          {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
        </p>
      </div>

      {/* Products Grid */}
      <div className="products-grid" id="wishlist-grid">
        {wishlist.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            wishlistIds={wishlistIds}
            onWishlistChange={handleWishlistChange}
          />
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
