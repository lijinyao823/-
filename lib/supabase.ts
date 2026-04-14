import { createClient } from '@supabase/supabase-js';

// 直接写死 URL 和 KEY 进行物理排查
const supabaseUrl = 'https://pcqvsdfplxzatotyufwv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjcXZzZGZwbHh6YXRvdHl1Znd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTc5ODMsImV4cCI6MjA5MTUzMzk4M30.Gxv67GSyhTPp76JxoRF2XXCMyCcuRDj75JCN-uQABIc';

console.warn("⚠️ 预警：当前正在使用硬编码 Supabase 配置，仅供调试使用！");
alert("Supabase文件已加载！");
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});