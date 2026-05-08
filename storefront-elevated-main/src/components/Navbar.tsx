import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">Elevated</Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/products?category=electronics" onClick={() => setMenuOpen(false)}>Electronics</Link>
          <Link to="/products?category=clothing" onClick={() => setMenuOpen(false)}>Clothing</Link>
          <Link to="/products?category=home-living" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products?category=sports" onClick={() => setMenuOpen(false)}>Sports</Link>
        </nav>

        <div className="navbar-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit"><Search size={16} /></button>
          </form>

          {user ? (
            <div className="user-menu">
              <Link to="/orders" title="My Orders"><User size={20} /></Link>
              <button className="btn-ghost" onClick={signOut}>Sign out</button>
            </div>
          ) : (
            <Link to="/auth" className="btn-ghost">Sign in</Link>
          )}

          <Link to="/cart" className="cart-btn">
            <ShoppingCart size={20} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
