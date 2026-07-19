import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubtmfmylltkqahdqeelc.supabase.co/rest/v1/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidG1mbXlsbHRrcWFoZHFlZWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjAwMTIsImV4cCI6MjA5ODQzNjAxMn0.TG7hwEio4bTV2IpDIk2BqcMgIg1JXLwXH682AOV7AUM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);