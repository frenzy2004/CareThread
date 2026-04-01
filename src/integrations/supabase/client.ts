import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sipldhvknkwpzhcvquhd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_NgnOSdabUdqncZ8OjNXOqQ_tIenPliy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
