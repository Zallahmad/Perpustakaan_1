<<<<<<< HEAD
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (for Client Components only)
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
=======
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
>>>>>>> af1936f632e83dbc3bc588bc8881d3533092e41f
}
