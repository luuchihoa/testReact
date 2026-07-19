import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avrnbefzxtznpodugacz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cm5iZWZ6eHR6bnBvZHVnYWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYxNTczOSwiZXhwIjoyMDk5MTkxNzM5fQ.bYiFK6uNpnBMbEJajk9qoPIiWAZ04EU6opNiUT1HTOc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('liturgy_contents')
    .select('liturgy_key, cycle, title, gospel_ref')
    .in('liturgy_key', ['feast_02_11', 'thuong_5_thu4']);
  
  if (error) console.error(error);
  else data.forEach(d => console.log(`key: ${d.liturgy_key} | cycle: ${d.cycle} | title: ${d.title?.substring(0, 60)} | gospel: ${d.gospel_ref}`));
}

run();
