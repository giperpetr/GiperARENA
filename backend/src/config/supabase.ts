// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Support both naming conventions (ANON_KEY from Supabase stack, SUPABASE_ANON_KEY for compatibility)
const supabaseUrl = process.env.SUPABASE_URL || process.env.API_EXTERNAL_URL || 'https://api.giperarena.space';
const supabaseAnonKey = process.env.ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// Validate required keys
if (!supabaseAnonKey || supabaseAnonKey === '') {
  console.error('❌ CRITICAL: ANON_KEY or SUPABASE_ANON_KEY is not set!');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('KEY')));
  throw new Error('ANON_KEY is required. Check your .env file on the server at /root/giperarena/.env');
}

if (!supabaseServiceKey || supabaseServiceKey === '') {
  console.error('❌ CRITICAL: SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY is not set!');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('KEY')));
  throw new Error('SERVICE_ROLE_KEY is required. Check your .env file on the server at /root/giperarena/.env');
}

console.info('✅ Supabase configuration loaded:');
console.info(`   URL: ${supabaseUrl}`);
console.info(`   ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`);
console.info(`   SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 20)}...`);

// Client for user operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.info('✅ Supabase clients initialized successfully');

export default { supabase, supabaseAdmin };
