import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Tag, Package, ShoppingCart } from 'lucide-react';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';  // Lab 5: global cart state

/**
 * Product Details Page
 * Route: /products/:id
 *
 * Flow:
 * 1. Reads the product ID from the URL using useParams()
 * 2. Fetches the product from GET /products/:id
 * 3. Displays full product details
 * 4. "Add to Cart" button is UI only (no backend cart in Lab 3)
 */
function ProductDetails() {
  // Get the :id from the URL (e.g. /products/66d123abc456)
  const { id } = useParams();
  const navigate = useNavigate();

  // State for the product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lab 5: Cart state for this page
  // addingToCart — true while the POST /cart request is running
  // cartMessage  — brief feedback shown after add attempt
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  // Fetch the product when the page loads
  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      setLoading(true);
      setError('');

      try {
        // Call GET /products/:id from the backend
        const data = await getProductById(id);

        if (isMounted) {
          setProduct(data.product);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        if (isMounted) {
          if (err.response && err.response.status === 404) {
            setError('Product not found. It may have been removed.');
          } else if (err.response && err.response.status === 400) {
            setError('Invalid product ID.');
          } else {
            setError('Something went wrong while loading the product.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]); // Re-fetch if the ID in the URL changes

  // Lab 5: Handle Add to Cart click on the Product Details page
  const handleAddToCart = async () => {
    if (addingToCart) return;    // prevent double-click
    setAddingToCart(true);
    setCartMessage('');

    const result = await addToCart(product._id);  // from CartContext

    if (result.success) {
      setCartMessage('Added to cart!');
    } else {
      setCartMessage(result.message || 'Could not add to cart.');
    }

    setAddingToCart(false);

    // Clear the message after 2.5 seconds
    setTimeout(() => setCartMessage(''), 2500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Loading product...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-detail-error" id="product-detail-error-msg">
        <div className="products-empty-icon">⚠️</div>
        <h3 className="products-empty-title">Oops!</h3>
        <p className="products-empty-subtitle">{error}</p>
        <button
          className="btn btn-secondary"
          style={{ marginTop: '16px', padding: '0 24px', height: '42px' }}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Format price in Indian Rupee format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-detail-page">
      {/* Back Navigation */}
      <div className="product-detail-breadcrumb">
        <Link to="/products" className="product-detail-back-link" id="back-to-products">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Main Product Detail Card */}
      <div className="product-detail-card">
        {/* Left: Product Image */}
        <div className="product-detail-image-wrap">
          <img
            src={product.image}
            alt={product.name}
            className="product-detail-image"
            id="product-detail-image"
            onError={(e) => {
              e.target.src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image';
            }}
          />
        </div>

        {/* Right: Product Information */}
        <div className="product-detail-info">
          {/* Category Badge */}
          <div className="product-category-badge" style={{ marginBottom: '12px' }}>
            <Tag size={12} />
            <span>{product.category}</span>
          </div>

          {/* Product Name */}
          <h1 className="product-detail-name" id="product-detail-name">
            {product.name}
          </h1>

          {/* Price */}
          <div className="product-detail-price" id="product-detail-price">
            {formattedPrice}
          </div>

          {/* Description */}
          <p className="product-detail-description" id="product-detail-description">
            {product.description}
          </p>

          {/* Stock Status */}
          <div
            className={`product-detail-stock ${
              isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-ok'
            }`}
            id="product-detail-stock"
          >
            <Package size={15} />
            <span>
              {isOutOfStock
                ? 'Out of Stock'
                : isLowStock
                ? `Only ${product.stock} units left!`
                : `${product.stock} units available`}
            </span>
          </div>

          {/* Add to Cart Button — Lab 5: wired to CartContext */}
          <button
            type="button"
            className="btn btn-primary product-detail-cart-btn"
            disabled={isOutOfStock || addingToCart}
            id="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} />
            <span>
              {isOutOfStock
                ? 'Out of Stock'
                : addingToCart
                ? 'Adding...'
                : 'Add to Cart'}
            </span>
          </button>

          {/* Cart feedback message shown after clicking Add to Cart */}
          {cartMessage && (
            <p
              id="product-detail-cart-msg"
              style={{
                marginTop: '8px',
                fontSize: '14px',
                color: cartMessage === 'Added to cart!' ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {cartMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
