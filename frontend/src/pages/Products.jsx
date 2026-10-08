import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { getProducts, getWishlist } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

// The list of categories shown in the dropdown
const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

/**
 * Products Page
 * Route: /products
 *
 * Flow:
 * 1. On load, fetches all products from GET /products
 * 2. When user types in search or changes category:
 *    → sends a new request GET /products?search=...&category=...
 *    → backend searches MongoDB
 *    → product list updates
 */
function Products() {
  // State for the list of products fetched from the backend
  const [products, setProducts] = useState([]);

  // State for the search input value
  const [search, setSearch] = useState('');

  // State for the selected category
  const [category, setCategory] = useState('All');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lab 4: Track which product IDs are in the wishlist (as a Set for O(1) lookup)
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Fetch the current user's wishlist once on mount (best-effort — ignored if not logged in)
  useEffect(() => {
    getWishlist()
      .then((data) => {
        const ids = new Set((data.wishlist || []).map((p) => p._id));
        setWishlistIds(ids);
      })
      .catch(() => {
        // User not logged in or wishlist unavailable — silently ignore
      });
  }, []);

  // Called by ProductCard when a wishlist add/remove succeeds
  const handleWishlistChange = (productId, isNowInWishlist) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isNowInWishlist) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  // Fetch products whenever search or category changes
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      setError('');

      try {
        // Call the API with search and category as parameters
        const data = await getProducts(search, category);

        if (isMounted) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        if (isMounted) {
          setError('Something went wrong while loading products. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Small delay (debounce) so we don't send a request on every single keystroke
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer); // Cancel the timer on cleanup
    };
  }, [search, category]); // Re-run whenever search or category changes

  return (
    <div className="products-page-container">
      {/* Page Header */}
      <div className="products-page-header">
        <div className="products-title-group">
          <ShoppingBag size={28} color="var(--brand-accent)" />
          <h1 className="products-page-title">Products</h1>
        </div>
        <p className="products-page-subtitle">
          Explore our curated collection of quality products
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="products-filter-bar">
        {/* Search Input */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Category Dropdown */}
        <select
          id="product-category-select"
          className="products-category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <span className="loading-text">Loading products...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="products-error-state" id="products-error-msg">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State — no results found */}
      {!loading && !error && products.length === 0 && (
        <div className="products-empty-state" id="products-empty-msg">
          <div className="products-empty-icon">🛍️</div>
          <h3 className="products-empty-title">No products found</h3>
          <p className="products-empty-subtitle">
            Try changing your search term or selecting a different category.
          </p>
        </div>
      )}

      {/* Products Grid — renders one card per product using .map() */}
      {!loading && !error && products.length > 0 && (
        <>
          <p className="products-result-count">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
          <div className="products-grid" id="products-grid">
            {products.map((product) => (
              /* Each ProductCard gets the product object and wishlist state as props */
              <ProductCard
                key={product._id}
                product={product}
                wishlistIds={wishlistIds}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Products;
