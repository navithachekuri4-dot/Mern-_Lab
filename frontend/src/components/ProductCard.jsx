import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tag, Package } from "lucide-react";
import { addToWishlist, removeFromWishlist } from "../services/api";
import { useCart } from "../context/CartContext";  // Lab 5: global cart state

/**
 * ProductCard Component
 * Displays a single product in a card format.
 * Used in the Products page (grid layout) and Wishlist page.
 *
 * Props:
 *  - product:          the product object from MongoDB
 *  - wishlistIds:      Set of product._id strings already in the wishlist (optional)
 *  - onWishlistChange: callback(productId, isNowInWishlist) called after add/remove (optional)
 */
function ProductCard({ product, wishlistIds = new Set(), onWishlistChange }) {
  // Format price in Indian Rupee style (e.g. Rs.4,999)
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);

  // Determine stock status message and color
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Wishlist state
  const isInWishlist = wishlistIds.has(product._id);
  const [saving, setSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  // Lab 5: Cart state
  // addingToCart — true while the POST /cart API call is in-flight
  // cartMessage  — short feedback shown below the button after success/failure
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  // Handle add/remove wishlist toggle
  const handleWishlistToggle = async () => {
    if (saving) return; // Prevent duplicate clicks while request is in-flight
    setSaving(true);
    setWishlistError("");

    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id);
        if (onWishlistChange) onWishlistChange(product._id, false);
      } else {
        await addToWishlist(product._id);
        if (onWishlistChange) onWishlistChange(product._id, true);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      setWishlistError("Unable to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Lab 5: Handle Add to Cart click
  // Calls addToCart() from CartContext which calls the API and refreshes cartItems
  const handleAddToCart = async () => {
    if (addingToCart) return;   // prevent double-click
    setAddingToCart(true);
    setCartMessage("");

    const result = await addToCart(product._id);  // from CartContext

    if (result.success) {
      setCartMessage("Added!");  // brief success feedback
    } else {
      setCartMessage(result.message || "Could not add to cart.");
    }

    setAddingToCart(false);

    // Clear the message after 2.5 seconds so it doesn't linger
    setTimeout(() => setCartMessage(""), 2500);
  };

  return (
    <div className="product-card" id={`product-card-${product._id}`}>
      {/* Product Image */}
      <div className="product-card-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-card-image"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Image";
          }}
        />
        {isOutOfStock && (
          <div className="product-out-of-stock-badge">Out of Stock</div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-card-body">
        <div className="product-category-badge">
          <Tag size={11} />
          <span>{product.category}</span>
        </div>

        <h3 className="product-card-name">{product.name}</h3>

        <div className="product-card-price">{formattedPrice}</div>

        <div
          className={`product-card-stock ${
            isOutOfStock ? "stock-out" : isLowStock ? "stock-low" : "stock-ok"
          }`}
        >
          <Package size={13} />
          <span>
            {isOutOfStock
              ? "Out of Stock"
              : isLowStock
              ? `Only ${product.stock} left!`
              : `${product.stock} in stock`}
          </span>
        </div>

        {wishlistError && (
          <p
            className="wishlist-error-text"
            id={`wishlist-error-${product._id}`}
          >
            {wishlistError}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="product-card-footer">
        <Link
          to={`/products/${product._id}`}
          className="btn btn-primary product-card-btn"
          id={`view-details-${product._id}`}
        >
          View Details
        </Link>

        {/* Lab 5: Add to Cart button */}
        <button
          type="button"
          className="btn btn-secondary product-card-btn"
          id={`add-to-cart-${product._id}`}
          onClick={handleAddToCart}
          disabled={addingToCart || isOutOfStock}
          title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
        >
          {addingToCart ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>

        <button
          type="button"
          className={`btn wishlist-btn ${
            isInWishlist ? "wishlist-btn-active" : "wishlist-btn-idle"
          }`}
          id={`wishlist-btn-${product._id}`}
          onClick={handleWishlistToggle}
          disabled={saving}
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {saving ? (
            <span>Saving...</span>
          ) : isInWishlist ? (
            <span>Remove from Wishlist</span>
          ) : (
            <span>Add to Wishlist</span>
          )}
        </button>
      </div>

      {/* Cart feedback message (success or error) */}
      {cartMessage && (
        <p
          className="wishlist-error-text"
          id={`cart-msg-${product._id}`}
          style={{ color: cartMessage === "Added!" ? "var(--success)" : undefined }}
        >
          {cartMessage}
        </p>
      )}
    </div>
  );
}

export default ProductCard;
