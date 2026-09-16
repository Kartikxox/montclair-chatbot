const { createClient } = require('@supabase/supabase-js');

// NOTE: use the Supabase *pooler* connection string in production (IPv4, port 6543),
// not the direct connection (IPv6) — this bit Indoarab on Railway/Render before.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

module.exports = supabase;
