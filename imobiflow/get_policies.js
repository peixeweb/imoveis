import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msyuluqmxdnvtsakusiu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeXVsdXFteGRudnRzYWt1c2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjA1MTUsImV4cCI6MjEwMDc5NjUxNX0.4ZxiDt6VScoguj7AJ_ZY4yZtwYno60cqsnlohvqArAI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching policies from database...");
  // We can execute SQL query via a RPC or check if there is an endpoint.
  // Wait, does the Supabase JS client allow running raw SQL or query pg_policies?
  // Let's try querying pg_policies via a generic select or RPC.
  // Since we don't have service_role, we might not be able to query system tables directly unless there's an RPC.
  // Let's see if we can do a simple select from pg_policies.
  const { data, error } = await supabase.from('pg_policies').select('*');
  console.log("pg_policies result:", data, error);
}

test();
