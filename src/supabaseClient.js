import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jurzdzkpkfxsoehfxgeg.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cnpkemtwa2Z4c29laGZ4Z2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjMxMDksImV4cCI6MjA3NjQ5OTEwOX0.tujHruq0I8e_OBkEoATw04eY1lsXbWEruizm5RUzblU"



export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

