import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(*)')
      .eq('featured', true)
      .limit(8)
      .then(({ data }) => setFeatured((data as Product[]) ?? []));

    supabase
      .from('categories')
      .select('*')
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">New arrivals 2026</p>
          <h1>Elevate your everyday.</h1>
          <p className="hero-sub">Premium products for modern living — curated with intention.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">Shop now <ArrowRight size={16} /></Link>
            <Link to="/products?category=electronics" className="btn-outline">Electronics</Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=900"
            alt="Featured product"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Shop by category</h2>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="category-card">
                <img src={cat.image_url} alt={cat.name} />
                <div className="category-overlay">
                  <span>{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured products</h2>
            <Link to="/products" className="see-all">See all <ArrowRight size={14} /></Link>
          </div>
          <div className="products-grid">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="banner">
        <div className="container banner-inner">
          <div>
            <h2>Free shipping on orders over $75</h2>
            <p>No promo code needed. Ships to all 50 states within 3–5 business days.</p>
          </div>
          <Link to="/products" className="btn-primary">Start shopping <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
