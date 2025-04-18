import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztsggacasdxjlkusperr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0c2dnYWNhc2R4amxrdXNwZXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDAxNjYsImV4cCI6MjA1OTE3NjE2Nn0.WIsEyfwIG45zFgd4tf8y8CmwKqZoroDjiQ0nFnftFzA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
