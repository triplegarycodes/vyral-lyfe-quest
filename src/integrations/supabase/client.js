import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = "https://jrsadhufnvpayrehnjoj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyc2FkaHVmbnZwYXlyZWhuam9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0OTAyNDksImV4cCI6MjA2OTA2NjI0OX0.U6HNxXRTLehYcDY3x3O0MN11k_Hwg054XMUwE8MZ7mM";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true
  }
});
export {
  supabase
};
