import { supabase as clientInstance } from './lib/supabase/client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.REACT_APP_SUPABASE_URL || 
  'https://bqfeekkbxcincwlvabdq.supabase.co';

const supabaseKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.REACT_APP_SUPABASE_KEY || 
  'sb_publishable_Lq4PB__oEVaBs-FUVbqODQ_Ic00Mv9J';

export const supabase = clientInstance || createClient(supabaseUrl, supabaseKey);
