import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Game = {
  id: string
  name: string
  location: string
  city: string
  date: string
  start_time: string
  end_time: string
  level: string | null
  num_teams: number
  players_per_team: number
  price: string
  is_private: boolean
  password_plain: string | null
  organizer_name: string
  organizer_session_id: string
  description: string | null
  created_at: string
}

export type Player = {
  id: string
  game_id: string
  name: string
  session_id: string
  status: string
  opt_out_reason: string | null
  joined_at: string
}
