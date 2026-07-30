import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jiabvnkhjriaurxlczlk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYWJ2bmtoanJpYXVyeGxjemxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDgyNTcsImV4cCI6MjEwMDI4NDI1N30.1y2f31bWsUID42Y2-L_CGCPApNo2I7g60Q9TO2d5LTg';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export type SupabaseClient = typeof supabase;