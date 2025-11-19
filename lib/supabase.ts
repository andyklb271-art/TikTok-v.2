
import { createClient } from '@supabase/supabase-js';

// Configuration with your provided credentials
const supabaseUrl = 'https://pbxaqloogagtapivtovt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieGFxbG9vZ2FndGFwaXZ0b3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTU3MjMsImV4cCI6MjA3OTA3MTcyM30.-kGdAWP3BlyrosUAPo2BAjf74XJzaVSdzo3qpebV0rs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
