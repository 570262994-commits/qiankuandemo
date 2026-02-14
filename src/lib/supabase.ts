import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getRedirectUrl = () => {
  return window.location.origin;
};

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? '已配置' : '未配置');
console.log('Current Origin:', getRedirectUrl());

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const getAuthRedirectUrl = () => getRedirectUrl();

if (!supabase) {
  console.error('Supabase 客户端创建失败：URL 或 Anon Key 未配置');
}
