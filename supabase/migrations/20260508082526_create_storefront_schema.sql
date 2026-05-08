/*
  # Storefront Schema

  1. New Tables
    - `categories` - Product categories (id, name, slug, image_url)
    - `products` - Products (id, name, slug, description, price, compare_price, image_url, category_id, stock, featured)
    - `cart_items` - Shopping cart per user (id, user_id, product_id, quantity)
    - `orders` - Customer orders (id, user_id, status, total, shipping_address)
    - `order_items` - Line items per order (id, order_id, product_id, quantity, unit_price)

  2. Security
    - RLS enabled on all tables
    - Products and categories: public read
    - Cart items: owner only
    - Orders and order_items: owner only

  3. Seed Data
    - 4 categories, 12 sample products
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL,
  compare_price numeric(10,2),
  image_url text DEFAULT '',
  category_id uuid REFERENCES categories(id),
  stock integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  total numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Seed categories
INSERT INTO categories (name, slug, image_url) VALUES
  ('Electronics', 'electronics', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Clothing', 'clothing', 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Home & Living', 'home-living', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Sports', 'sports', 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT (slug) DO NOTHING;

-- Seed products
INSERT INTO products (name, slug, description, price, compare_price, image_url, category_id, stock, featured)
SELECT
  p.name, p.slug, p.description, p.price, p.compare_price, p.image_url, c.id, p.stock, p.featured
FROM (VALUES
  ('Wireless Noise-Cancelling Headphones', 'wireless-headphones', 'Premium sound quality with active noise cancellation and 30-hour battery life.', 189.99, 249.99, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', 'electronics', 45, true),
  ('Mechanical Keyboard', 'mechanical-keyboard', 'Tactile brown switches, RGB backlighting, and a compact tenkeyless layout.', 129.99, NULL, 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=800', 'electronics', 30, true),
  ('Smart Watch Series 5', 'smart-watch', 'Health tracking, GPS, and 7-day battery in a slim aluminum case.', 299.99, 349.99, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', 'electronics', 20, true),
  ('Portable Bluetooth Speaker', 'bluetooth-speaker', 'Waterproof, 360° sound, and 12-hour playtime for outdoor adventures.', 79.99, 99.99, 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=800', 'electronics', 60, false),
  ('Classic White Tee', 'classic-white-tee', '100% organic cotton, relaxed fit, ethically made.', 34.99, NULL, 'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=800', 'clothing', 100, false),
  ('Slim Fit Chinos', 'slim-chinos', 'Stretch twill fabric, modern slim fit, five-pocket styling.', 69.99, 89.99, 'https://images.pexels.com/photos/1082526/pexels-photo-1082526.jpeg?auto=compress&cs=tinysrgb&w=800', 'clothing', 75, true),
  ('Leather Sneakers', 'leather-sneakers', 'Full-grain leather upper with cushioned insole and rubber outsole.', 119.99, 149.99, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', 'clothing', 40, true),
  ('Minimalist Desk Lamp', 'desk-lamp', 'Adjustable arm, warm/cool lighting modes, USB-C charging port.', 59.99, NULL, 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800', 'home-living', 55, false),
  ('Ceramic Pour-Over Set', 'pour-over-set', 'Handcrafted ceramic dripper with matching carafe and filter papers.', 49.99, 64.99, 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800', 'home-living', 35, false),
  ('Linen Throw Blanket', 'linen-throw', 'Stonewashed linen blend, 130x170cm, machine washable in four earthy tones.', 89.99, NULL, 'https://images.pexels.com/photos/6032283/pexels-photo-6032283.jpeg?auto=compress&cs=tinysrgb&w=800', 'home-living', 50, true),
  ('Foam Yoga Mat', 'yoga-mat', '6mm thick TPE foam, non-slip surface, carrying strap included.', 44.99, 59.99, 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=800', 'sports', 80, false),
  ('Running Shoes Pro', 'running-shoes', 'Responsive foam midsole, engineered mesh upper, heel-to-toe drop 8mm.', 149.99, 179.99, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', 'sports', 55, true)
) AS p(name, slug, description, price, compare_price, image_url, cat_slug, stock, featured)
JOIN categories c ON c.slug = p.cat_slug
ON CONFLICT (slug) DO NOTHING;
