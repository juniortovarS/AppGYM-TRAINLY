import AppStorage from './storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://hmanrlawckcwvdvasuyy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYW5ybGF3Y2tjd3ZkdmFzdXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTY0MzUsImV4cCI6MjA5NTAzMjQzNX0.0jJ101LFbnVxgcSAObn19CzS3RTRC7t12OwrxU6B5Hs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AppStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
