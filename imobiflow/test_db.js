import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msyuluqmxdnvtsakusiu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeXVsdXFteGRudnRzYWt1c2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjA1MTUsImV4cCI6MjEwMDc5NjUxNX0.4ZxiDt6VScoguj7AJ_ZY4yZtwYno60cqsnlohvqArAI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking corretores table...");
  const { data, error } = await supabase.from('corretores').select('*').limit(5);
  if (error) {
    console.error("Error fetching corretores:", error);
  } else {
    console.log("Corretores fetched successfully:", data);
  }
}

check();
