import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://yzrfkfxbwmibzvglmyyb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cmZrZnhid21pYnp2Z2xteXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTY2NjEsImV4cCI6MjA5Mjg5MjY2MX0.rPqxO9nnbeQWk67KdtiWOLAIU1wTDT1J1qvH0Y3pRlk',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)
