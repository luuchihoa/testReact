import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avrnbefzxtznpodugacz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cm5iZWZ6eHR6bnBvZHVnYWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYxNTczOSwiZXhwIjoyMDk5MTkxNzM5fQ.bYiFK6uNpnBMbEJajk9qoPIiWAZ04EU6opNiUT1HTOc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const keys = [
    'feast_cn_le_la', 
    'feast_chua_thang_thien', 
    'feast_hien_xuong', 
    'feast_ba_ngoi'
  ];
  
  for (const key of keys) {
    const { data, error } = await supabase
      .from('liturgy_contents')
      .select('liturgy_key, cycle, title')
      .eq('liturgy_key', key)
      .order('cycle');
    
    if (error) console.error(error);
    else {
      console.log(`\n=== ${key} ===`);
      data.forEach(d => console.log(`  cycle: ${d.cycle} | ${d.title}`));
    }
  }
}

run();
