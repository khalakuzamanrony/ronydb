const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function getGMT6ISOString() {
  const now = new Date();
  // Add 6 hours (6 * 60 * 60 * 1000 ms)
  const gmt6 = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return gmt6.toISOString();
}

async function updateKeepalive() {
  const gmt6Time = getGMT6ISOString();
  const message = `updated at ${gmt6Time}`;
  const { error } = await supabase
    .from('keepalive')
    .upsert([{ id: 'main', updated: message }], { onConflict: ['id'] });

  if (error) {
    console.error('Failed to update keepalive:', error.message);
    process.exit(1);
  } else {
    console.log('keepalive updated @', gmt6Time);
  }
}

updateKeepalive(); 