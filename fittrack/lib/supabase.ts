import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      weight_logs: {
        Row: { id: string; date: string; weight_kg: number; note: string | null; created_at: string }
        Insert: { date: string; weight_kg: number; note?: string }
        Update: { date?: string; weight_kg?: number; note?: string }
      }
      nutrition_logs: {
        Row: { id: string; date: string; calories: number; protein_g: number; is_cheat_day: boolean; note: string | null; created_at: string }
        Insert: { date: string; calories: number; protein_g: number; is_cheat_day?: boolean; note?: string }
        Update: { date?: string; calories?: number; protein_g?: number; is_cheat_day?: boolean; note?: string }
      }
      workout_logs: {
        Row: { id: string; date: string; workout_day: string; completed: boolean; duration_min: number | null; note: string | null; created_at: string; exercises: ExerciseLog[] }
        Insert: { date: string; workout_day: string; completed: boolean; duration_min?: number; note?: string; exercises?: ExerciseLog[] }
        Update: { completed?: boolean; duration_min?: number; note?: string; exercises?: ExerciseLog[] }
      }
    }
  }
}

export type ExerciseLog = {
  exercise_id: string
  sets: { set_num: number; reps: number; weight_kg: number }[]
}
