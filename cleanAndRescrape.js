import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avrnbefzxtznpodugacz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cm5iZWZ6eHR6bnBvZHVnYWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYxNTczOSwiZXhwIjoyMDk5MTkxNzM5fQ.bYiFK6uNpnBMbEJajk9qoPIiWAZ04EU6opNiUT1HTOc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  await supabase.from('liturgy_contents').delete().eq('liturgy_key', 'thuong_5_thu4').in('cycle', ['all', 'II']);
  await supabase.from('liturgy_contents').delete().eq('liturgy_key', 'feast_02_11');
  console.log('Cleaned.');
}

run();
