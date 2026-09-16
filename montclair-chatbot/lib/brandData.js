const supabase = require('./supabaseClient');

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = {
  brand: null,
  products: null,
  knowledgeBase: null,
  fetchedAt: 0,
};

const BRAND_ID = process.env.BRAND_ID || 'montclair';

function isCacheFresh() {
  return cache.brand && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}

async function loadBrandData(forceRefresh = false) {
  if (!forceRefresh && isCacheFresh()) {
    return cache;
  }

  const { data: brand, error: brandErr } = await supabase
    .from('brands')
    .select('*')
    .eq('id', BRAND_ID)
    .single();

  if (brandErr) {
    console.error('Error loading brand row:', brandErr.message);
  }

  const { data: products, error: productsErr } = await supabase
    .from('products')
    .select('*')
    .eq('brand_id', BRAND_ID);

  if (productsErr) {
    console.error('Error loading products:', productsErr.message);
  }

  const { data: knowledgeBase, error: kbErr } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('brand_id', BRAND_ID);

  if (kbErr) {
    console.error('Error loading knowledge_base:', kbErr.message);
  }

  cache.brand = brand || cache.brand;
  cache.products = products || [];
  cache.knowledgeBase = knowledgeBase || [];
  cache.fetchedAt = Date.now();

  return cache;
}

// Filter out-of-stock products before they ever reach the Gemini prompt layer.
function getInStockProducts(products) {
  return (products || []).filter((p) => p.in_stock !== false && (p.stock_qty == null || p.stock_qty > 0));
}

module.exports = { loadBrandData, getInStockProducts, BRAND_ID };
