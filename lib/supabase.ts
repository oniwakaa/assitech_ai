import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://lsbnfiwghvubdaxpjqln.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzYm5maXdnaHZ1YmRheHBqcWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mjk3MzMsImV4cCI6MjA3ODAwNTczM30.xVn4OAw4a50L8LmnrAMcibw0_ZzYAKJx99Q_tq7UYlQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzYm5maXdnaHZ1YmRheHBqcWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQyOTczMywiZXhwIjoyMDc4MDA1NzMzfQ.GwaOcb0okX-9zowTyi-ITexH9tWeaze23X3tXjme0R4",
);
