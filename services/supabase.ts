
import { createClient } from '@supabase/supabase-js';

// Credentials provided for KeshoMarket project
const supabaseUrl = 'https://pwbjhvscpcjhkkheflit.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3YmpodnNjcGNqaGtraGVmbGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzgxMTksImV4cCI6MjA4NTk1NDExOX0.L147MkEm0tF2f4nttHU9OG13DXHtm1ve0KcZFPXaEv8';

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
