import {
  createClient
} from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://zzlnajyhigcjowipktkk.supabase.co";
const supabaseKey = "sb_publishable_AiHPPzAgD-bpWbqRlY6RQw_7TiSiPVu";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
