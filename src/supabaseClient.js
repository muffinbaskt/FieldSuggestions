import { createClient } from "@supabase/supabase-js";

// Same Supabase project as the main Riggy app — this tiny app only ever
// inserts into the field_requests table, which is the only thing its
// database permissions allow it to do.
const SUPABASE_URL = "https://vwvppivdpxjvmaazcmmg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fiRpkzR_UGEzQT69Vp96qA_TsK_0cyg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
