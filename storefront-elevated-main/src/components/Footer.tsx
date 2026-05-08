import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="logo">Elevated</span>
          <p>Premium products, thoughtfully curated for modern living.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Shop</h4>
            <Link to="/products?category=electronics">Electronics</Link>
            <Link to="/products?category=clothing">Clothing</Link>
            <Link to="/products?category=home-living">Home & Living</Link>
            <Link to="/products?category=sports">Sports</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/auth">Sign In</Link>
            <Link to="/auth?mode=signup">Create Account</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#">FAQ</a>
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Elevated. All rights reserved.</p>
          <div className="payment-icons">
            <span>VISA</span>
            <span>MC</span>
            <span>AMEX</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
