import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  if (!user) return (
    <main className="section container empty-state">
      <p>Sign in to view your orders.</p>
      <Link to="/auth" className="btn-primary">Sign in</Link>
    </main>
  );

  if (loading) return <div className="section container"><div className="loading-spinner" /></div>;

  if (orders.length === 0) return (
    <main className="section container empty-state">
      <Package size={48} />
      <p>No orders yet.</p>
      <Link to="/products" className="btn-primary">Start shopping</Link>
    </main>
  );

  return (
    <main className="section">
      <div className="container">
        <h1>My orders</h1>
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <p className="order-id">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="order-date">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="order-meta">
                  <span className={`order-status ${order.status}`}>{order.status}</span>
                  <span className="order-total">${order.total.toFixed(2)}</span>
                </div>
              </div>
              {order.shipping_address && (
                <p className="order-address">
                  {(order.shipping_address as { address?: string; city?: string; state?: string }).address}, {(order.shipping_address as { address?: string; city?: string; state?: string }).city}, {(order.shipping_address as { address?: string; city?: string; state?: string }).state}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
