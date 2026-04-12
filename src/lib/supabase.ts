// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 优先读取环境变量，如果读不到（undefined），则直接使用硬编码的字符串
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcqvsdfplxzatotyufwv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GYwTa7IECxcuSLVSbJyY6g_y2KXd8rN';

console.log("正在尝试连接数据库:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);