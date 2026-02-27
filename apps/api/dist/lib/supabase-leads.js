import { createClient } from '@supabase/supabase-js';
import { LEADS_SUPABASE_URL, LEADS_SUPABASE_SERVICE_KEY } from '../config/env.js';
export const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_SERVICE_KEY);
