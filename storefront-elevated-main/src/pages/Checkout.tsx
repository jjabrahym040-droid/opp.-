import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle } from 'lucide-react';

type Address = {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'shipping' | 'confirm' | 'done'>('shipping');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const [address, setAddress] = useState<Address>({
    name: '',
    email: user?.email ?? '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  if (!user) return (
    <main className="section container empty-state">
      <p>Sign in to checkout.</p>
      <Link to="/auth" className="btn-primary">Sign in</Link>
    </main>
  );

  if (items.length === 0 && step !== 'done') {
    navigate('/cart');
    return null;
  }

  const shipping = total >= 75 ? 0 : 8.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError('');

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'confirmed',
        total: orderTotal,
        shipping_address: address,
      })
      .select()
      .single();

    if (orderErr || !order) {
      setError('Failed to place order. Please try again.');
      setSubmitting(false);
      return;
    }

    const lineItems = items.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.products?.price ?? 0,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(lineItems);
    if (itemsErr) {
      setError('Order placed but items failed. Contact support.');
      setSubmitting(false);
      return;
    }

    await clearCart();
    setOrderId(order.id);
    setStep('done');
    setSubmitting(false);
  };

  if (step === 'done') return (
    <main className="section">
      <div className="container order-success">
        <CheckCircle size={64} />
        <h1>Order placed!</h1>
        <p>Thank you for your purchase. Your order <code>{orderId.slice(0, 8).toUpperCase()}</code> is confirmed.</p>
        <p>A confirmation will be sent to <strong>{address.email}</strong>.</p>
        <div className="order-success-actions">
          <Link to="/orders" className="btn-primary">View orders</Link>
          <Link to="/products" className="btn-outline">Continue shopping</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main className="section">
      <div className="container">
        <div className="checkout-steps">
          <span className={step === 'shipping' ? 'active' : 'done'}>1. Shipping</span>
          <span className={step === 'confirm' ? 'active' : ''}>2. Confirm</span>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form-area">
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="checkout-form">
                <h2>Shipping information</h2>
                <div className="form-row">
                  <label>Full name<input required value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))} /></label>
                  <label>Email<input type="email" required value={address.email} onChange={e => setAddress(a => ({ ...a, email: e.target.value }))} /></label>
                </div>
                <label>Street address<input required value={address.address} onChange={e => setAddress(a => ({ ...a, address: e.target.value }))} /></label>
                <div className="form-row">
                  <label>City<input required value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} /></label>
                  <label>State<input required value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} /></label>
                  <label>ZIP<input required value={address.zip} onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))} /></label>
                </div>
                <button type="submit" className="btn-primary full-width">Continue to review</button>
              </form>
            )}

            {step === 'confirm' && (
              <div className="checkout-confirm">
                <h2>Review your order</h2>
                <div className="confirm-address">
                  <h3>Shipping to</h3>
                  <p>{address.name}</p>
                  <p>{address.address}, {address.city}, {address.state} {address.zip}</p>
                  <button className="btn-ghost small" onClick={() => setStep('shipping')}>Edit</button>
                </div>
                <div className="confirm-items">
                  {items.map(i => (
                    <div key={i.id} className="confirm-item">
                      <img src={i.products?.image_url} alt={i.products?.name} />
                      <span>{i.products?.name} × {i.quantity}</span>
                      <span>${((i.products?.price ?? 0) * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {error && <p className="form-error">{error}</p>}
                <button
                  className="btn-primary full-width"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? 'Placing order…' : 'Place order'}
                </button>
              </div>
            )}
          </div>

          <div className="cart-summary">
            <h2>Summary</h2>
            {items.map(i => (
              <div key={i.id} className="summary-item">
                <span>{i.products?.name} × {i.quantity}</span>
                <span>${((i.products?.price ?? 0) * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-row total"><span>Total</span><span>${orderTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
