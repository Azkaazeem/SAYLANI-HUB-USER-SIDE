import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://srjpepewfuumaqgadyoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanBlcGV3ZnV1bWFxZ2FkeW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzk3MTEsImV4cCI6MjA4MDY1NTcxMX0.9UUk7eGAl0mEpddg3brdIsOB_diT4R8IJ6YTh-zptbU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);