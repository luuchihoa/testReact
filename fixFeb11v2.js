import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avrnbefzxtznpodugacz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cm5iZWZ6eHR6bnBvZHVnYWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYxNTczOSwiZXhwIjoyMDk5MTkxNzM5fQ.bYiFK6uNpnBMbEJajk9qoPIiWAZ04EU6opNiUT1HTOc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Xóa TẤT CẢ bản ghi thuong_5_thu4 có cycle all và II (bị ghi đè sai)
  const { error: e1 } = await supabase
    .from('liturgy_contents')
    .delete()
    .eq('liturgy_key', 'thuong_5_thu4')
    .in('cycle', ['all', 'II']);
  
  if (e1) console.error('Delete error:', e1);
  else console.log('Deleted corrupted thuong_5_thu4 (all, II).');

  // Xóa feast_02_11 cũ nếu có
  const { error: e2 } = await supabase
    .from('liturgy_contents')
    .delete()
    .eq('liturgy_key', 'feast_02_11');
  
  if (e2) console.error('Delete error:', e2);
  else console.log('Deleted old feast_02_11.');

  // Kiểm tra lại
  const { data } = await supabase
    .from('liturgy_contents')
    .select('liturgy_key, cycle, title')
    .in('liturgy_key', ['thuong_5_thu4', 'feast_02_11']);
  console.log('After cleanup:', data);
}

run();
