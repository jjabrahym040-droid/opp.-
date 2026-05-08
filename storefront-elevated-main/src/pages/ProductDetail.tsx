import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data as Product | null);
        setLoading(false);
      });
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) { navigate('/auth'); return; }
    await addToCart(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="section container"><div className="loading-spinner" /></div>;
  if (!product) return (
    <div className="section container empty-state">
      <p>Product not found.</p>
      <Link to="/products" className="btn-primary">Back to shop</Link>
    </div>
  );

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  return (
    <main className="section">
      <div className="container">
        <Link to="/products" className="back-link"><ArrowLeft size={16} /> Back to products</Link>

        <div className="product-detail-grid">
          <div className="product-detail-img">
            <img src={product.image_url} alt={product.name} />
            {discount && <span className="badge-sale large">-{discount}%</span>}
          </div>

          <div className="product-detail-info">
            <p className="product-category">{product.categories?.name}</p>
            <h1>{product.name}</h1>
            <div className="product-price-row">
              <span className="price large">${product.price.toFixed(2)}</span>
              {product.compare_price && (
                <span className="price-compare">${product.compare_price.toFixed(2)}</span>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            <div className="stock-status">
              {product.stock > 10
                ? <span className="in-stock">In stock ({product.stock} available)</span>
                : product.stock > 0
                ? <span className="low-stock">Only {product.stock} left</span>
                : <span className="out-of-stock">Out of stock</span>
              }
            </div>

            <div className="quantity-row">
              <label>Quantity</label>
              <div className="qty-controls">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
            </div>

            <button
              className={`btn-primary full-width ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart size={18} />
              {added ? 'Added!' : 'Add to cart'}
            </button>

            <div className="product-perks">
              <div className="perk"><Package size={16} /><span>Free shipping over $75</span></div>
              <div className="perk"><RefreshCw size={16} /><span>30-day returns</span></div>
              <div className="perk"><Shield size={16} /><span>2-year warranty</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
