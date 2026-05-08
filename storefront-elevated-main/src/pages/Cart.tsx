import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, total, updateQuantity, removeItem, loading } = useCart();
  const { user } = useAuth();

  if (!user) return (
    <main className="section container empty-state">
      <ShoppingBag size={48} />
      <p>Sign in to view your cart.</p>
      <Link to="/auth" className="btn-primary">Sign in</Link>
    </main>
  );

  if (loading) return <div className="section container"><div className="loading-spinner" /></div>;

  if (items.length === 0) return (
    <main className="section container empty-state">
      <ShoppingBag size={48} />
      <p>Your cart is empty.</p>
      <Link to="/products" className="btn-primary">Start shopping</Link>
    </main>
  );

  const shipping = total >= 75 ? 0 : 8.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  return (
    <main className="section">
      <div className="container">
        <h1>Your cart</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.products?.image_url}
                  alt={item.products?.name}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <p className="cart-item-category">{item.products?.categories?.name}</p>
                  <h3>{item.products?.name}</h3>
                  <p className="cart-item-price">${item.products?.price.toFixed(2)}</p>
                </div>
                <div className="qty-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className="cart-item-subtotal">
                  ${((item.products?.price ?? 0) * item.quantity).toFixed(2)}
                </div>
                <button className="btn-remove" onClick={() => removeItem(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order summary</h2>
            <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-row total"><span>Total</span><span>${orderTotal.toFixed(2)}</span></div>
            {total < 75 && (
              <p className="shipping-note">Add ${(75 - total).toFixed(2)} more for free shipping</p>
            )}
            <Link to="/checkout" className="btn-primary full-width">
              Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/products" className="btn-ghost full-width">Continue shopping</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
