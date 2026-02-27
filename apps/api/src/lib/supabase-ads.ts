import { createClient } from '@supabase/supabase-js';
import { ADS_SUPABASE_URL, ADS_SUPABASE_SERVICE_KEY } from '../config/env.js';

export const supabaseAds = createClient(ADS_SUPABASE_URL, ADS_SUPABASE_SERVICE_KEY);
