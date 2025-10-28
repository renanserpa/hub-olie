import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qrfvdoecpmcnlpxklcsu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZnZkb2VjcG1jbmxweGtsY3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA2MzQxMDUsImV4cCI6MjAzNjIwMDEwNX0.2YSAI52F7e61pXQ3i_211sV521-gC5B9qrN9qc4w_yQ'

export const supabase = createClient(supabaseUrl, supabaseKey)