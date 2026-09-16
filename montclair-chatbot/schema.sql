-- Run this whole file in Supabase: Project -> SQL Editor -> New Query -> paste -> Run.

create table if not exists brands (
  id text primary key,
  name text not null,
  description text,
  website text
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  name text not null,
  price numeric,
  compare_at_price numeric,
  category text,
  scent_notes text,
  product_url text,
  stock_qty integer,
  in_stock boolean default true
);

create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  question text not null,
  answer text not null
);

-- Brand row
insert into brands (id, name, description, website)
values (
  'montclair',
  'Montclair',
  'Indian D2C luxury fragrance brand -- premium perfumes for men, women, and unisex, crafted with heritage-inspired artistry.',
  'montclairindia.com'
)
on conflict (id) do nothing;

-- Product catalog, pulled from montclairindia.com on 2026-09-14.
-- Prices are current sale prices; compare_at_price is the listed "regular" price.
insert into products (brand_id, name, price, compare_at_price, category, scent_notes, product_url)
values
  ('montclair', 'Born To Be Wild', 1350, 2200, 'Date Night', 'Top Rated', 'https://montclairindia.com/products/born-to-be-wild'),
  ('montclair', 'Love Unmade', 1350, 2200, 'Bestseller', 'Most Loved', 'https://montclairindia.com/products/love-unmade'),
  ('montclair', 'Kiss My Aura', 1350, 2200, 'Office Wear', 'Bestseller', 'https://montclairindia.com/products/kiss-my-aura'),
  ('montclair', 'Golden Sin', 1550, 2399, 'Party Wear', 'Leathery', 'https://montclairindia.com/products/golden-sin'),
  ('montclair', 'Dark Lord', 1350, 2200, 'Date Night', 'Dark', 'https://montclairindia.com/products/dark-lord'),
  ('montclair', 'Lost In Oud', 1550, 2399, 'Party Wear', 'Oud', 'https://montclairindia.com/products/lost-in-oud'),
  ('montclair', 'Worth The Risk', 1400, 2399, 'Party Wear', 'Elegant', 'https://montclairindia.com/products/worth-the-risk'),
  ('montclair', 'Candy Bouquet', 1350, 2200, 'Daily Wear', 'Elegant', 'https://montclairindia.com/products/candy-bouquet'),
  ('montclair', 'The First Kiss', 1350, 2200, 'Daily Wear', 'Sweet', 'https://montclairindia.com/products/the-first-kiss'),
  ('montclair', 'Eyes Of Desire', 1350, 2200, 'Daily Wear', 'Velvety', 'https://montclairindia.com/products/eyes-of-desire'),
  ('montclair', 'Smokin Beauty', 1350, 2200, 'Daily Wear', 'Sensual, Smoky', 'https://montclairindia.com/products/smokin-beauty'),
  ('montclair', 'Bali Breeze', 1350, 2200, 'Office Wear', 'Luminous', 'https://montclairindia.com/products/bali-breeze')
on conflict do nothing;

-- Basic FAQ seed -- expand as real customer questions come in.
insert into knowledge_base (brand_id, question, answer)
values
  ('montclair', 'Does Montclair have a discovery/sample set?', 'Yes -- Montclair offers a Discovery Set (testing kit) so customers can try multiple scents before buying a full bottle.'),
  ('montclair', 'How can I contact Montclair support?', 'You can reach Montclair at itsyourmontclair@gmail.com, call +91 79826 35392, or message on Instagram @montclairindia.'),
  ('montclair', 'How do I track my order?', 'Orders can be tracked on the "Track Your Order" page at montclairindia.com/pages/track-your-order, or by asking this assistant for your order number.'),
  ('montclair', 'Is there a discount for buying multiple perfumes?', 'Montclair runs bundle offers -- Buy 2 Get 5% Off, Buy 3 Get Extra 10% Off, plus an extra 5% off on prepaid orders.')
on conflict do nothing;
