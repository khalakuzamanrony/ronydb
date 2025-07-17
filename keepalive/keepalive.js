const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateKeepalive() {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('keepalive')
    .upsert([{ id: 'main', updated: now }], { onConflict: ['id'] });

  if (error) {
    console.error('Failed to update keepalive:', error.message);
    process.exit(1);
  } else {
    console.log('keepalive updated @', now);
  }
}

updateKeepalive(); 