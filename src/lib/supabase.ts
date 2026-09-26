// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Browser (client-side) Supabase client using public anon key
export const supabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
