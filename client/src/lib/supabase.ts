import { createClient } from '@supabase/supabase-js';

// For demo purposes, we'll use placeholder values if env vars are not available
const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://mtmubjshdqxkgxvcazfi.supabase.co';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bXVianNoZHF4a2d4dmNhemZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODIzMDUsImV4cCI6MjA3MjE1ODMwNX0.wX0GPafOvNn8lZ6nShxTKdch22n7Qmzub28fIWa_yYg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
