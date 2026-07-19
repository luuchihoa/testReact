import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avrnbefzxtznpodugacz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cm5iZWZ6eHR6bnBvZHVnYWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYxNTczOSwiZXhwIjoyMDk5MTkxNzM5fQ.bYiFK6uNpnBMbEJajk9qoPIiWAZ04EU6opNiUT1HTOc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const targets = ['feast_chua_thang_thien', 'feast_ba_ngoi', 'feast_cn_le_la', 'feast_hien_xuong'];
  
  for (const t of targets) {
    const { error } = await supabase
      .from('liturgy_contents')
      .delete()
      .match({ liturgy_key: t, cycle: 'all' });
      
    if (error) console.error(error);
    else console.log(`Deleted cycle: all for ${t}`);
  }
}

run();
