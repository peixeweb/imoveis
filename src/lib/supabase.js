import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://msyuluqmxdnvtsakusiu.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeXVsdXFteGRudnRzYWt1c2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjA1MTUsImV4cCI6MjEwMDc5NjUxNX0.4ZxiDt6VScoguj7AJ_ZY4yZtwYno60cqsnlohvqArAI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
