import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name A–Z' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('created_at-desc');
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') ?? '';
  const query = searchParams.get('q') ?? '';

  useEffect(() => {
    setLoading(true);
    const [col, dir] = sort.split('-');

    let q = supabase
      .from('products')
      .select('*, categories(*)')
      .order(col, { ascending: dir === 'asc' });

    if (category) q = q.eq('categories.slug', category);
    if (query) q = q.ilike('name', `%${query}%`);

    q.then(({ data }) => {
      let filtered = (data as Product[]) ?? [];
      if (category) filtered = filtered.filter(p => p.categories?.slug === category);
      setProducts(filtered);
      setLoading(false);
    });
  }, [category, query, sort]);

  const pageTitle = query
    ? `Search: "${query}"`
    : category
    ? products[0]?.categories?.name ?? 'Products'
    : 'All Products';

  return (
    <main className="section">
      <div className="container">
        <div className="products-page-header">
          <div>
            <h1>{pageTitle}</h1>
            <p className="product-count">{loading ? '—' : products.length} products</p>
          </div>
          <div className="products-controls">
            <button className="btn-ghost icon-btn" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select
              className="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="filters-bar">
            <button
              className={`filter-chip ${!category ? 'active' : ''}`}
              onClick={() => setSearchParams({})}
            >All</button>
            {['electronics', 'clothing', 'home-living', 'sports'].map(slug => (
              <button
                key={slug}
                className={`filter-chip ${category === slug ? 'active' : ''}`}
                onClick={() => setSearchParams({ category: slug })}
              >
                {slug.replace('-', ' & ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found.</p>
            <button className="btn-primary" onClick={() => setSearchParams({})}>Clear filters</button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </main>
  );
}
