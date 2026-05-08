import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Props = { product: Product };

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { navigate('/auth'); return; }
    await addToCart(product.id);
  };

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-img">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {discount && <span className="badge-sale">-{discount}%</span>}
        {product.stock === 0 && <span className="badge-oos">Out of stock</span>}
      </div>
      <div className="product-card-body">
        <p className="product-category">{product.categories?.name}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price-row">
          <span className="price">${product.price.toFixed(2)}</span>
          {product.compare_price && (
            <span className="price-compare">${product.compare_price.toFixed(2)}</span>
          )}
        </div>
        <button
          className="btn-add-cart"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={14} />
          Add to cart
        </button>
      </div>
    </Link>
  );
}
