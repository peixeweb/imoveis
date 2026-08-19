import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msyuluqmxdnvtsakusiu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeXVsdXFteGRudnRzYWt1c2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjA1MTUsImV4cCI6MjEwMDc5NjUxNX0.4ZxiDt6VScoguj7AJ_ZY4yZtwYno60cqsnlohvqArAI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = `test_${Math.random().toString(36).substring(7)}@example.com`;
  const password = 'password123';
  
  console.log(`1. Signing up user: ${email}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (authError) {
    console.error("Signup error:", authError);
    return;
  }
  
  const user = authData.user;
  console.log(`User created with ID: ${user.id}`);
  
  // Try to insert a profile
  console.log("2. Inserting profile into corretores...");
  const { data: corrData, error: corrError } = await supabase.from('corretores').insert({
    user_id: user.id,
    nome: 'Test Broker',
    whatsapp: '11999999999',
    creci: '12345',
    modo: 'solo',
    status: 'ativo',
    is_admin: true
  }).select();
  
  if (corrError) {
    console.error("Insert profile error:", corrError);
    return;
  }
  
  console.log("Profile inserted successfully:", corrData);
  
  // Try to query the profile
  console.log("3. Querying profile from corretores...");
  const { data: selectData, error: selectError } = await supabase.from('corretores').select('*').eq('user_id', user.id);
  if (selectError) {
    console.error("Query profile error (This is likely the bug!):", selectError);
  } else {
    console.log("Query profile success:", selectData);
  }
}

test();
