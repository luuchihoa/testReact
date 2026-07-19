import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avrnbefzxtznpodugacz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cm5iZWZ6eHR6bnBvZHVnYWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYxNTczOSwiZXhwIjoyMDk5MTkxNzM5fQ.bYiFK6uNpnBMbEJajk9qoPIiWAZ04EU6opNiUT1HTOc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Xóa các bản ghi bị sai của thuong_5_thu4 có title chứa "Lễ Đức Mẹ Lộ Đức"
  const { data, error } = await supabase
    .from('liturgy_contents')
    .delete()
    .eq('liturgy_key', 'thuong_5_thu4')
    .like('title', '%Lễ Đức Mẹ Lộ Đức%');
  
  if (error) console.error(error);
  else console.log('Deleted wrong thuong_5_thu4 rows with feast title.');

  // Kiểm tra lại
  const { data: remaining } = await supabase
    .from('liturgy_contents')
    .select('liturgy_key, cycle, title')
    .eq('liturgy_key', 'thuong_5_thu4');
  console.log('Remaining thuong_5_thu4:', remaining);
}

run();
