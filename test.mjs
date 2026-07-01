import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54421',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function test() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.log("ERROR TYPE:", error.constructor.name);
    console.log("ERROR MESSAGE:", error.message);
    console.log("ERROR STATUS:", error.status);
    console.log("FULL ERROR:", error);
  } else {
    console.log("SUCCESS:", data);
  }
}

test();
