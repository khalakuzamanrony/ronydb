const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function keepAlive() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cv_data?id=eq.main`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ updated: new Date().toISOString() })
  });
  if (!res.ok) {
    console.error('Failed to update:', await res.text());
    process.exit(1);
  }
  console.log('Keepalive success');
}

keepAlive(); 