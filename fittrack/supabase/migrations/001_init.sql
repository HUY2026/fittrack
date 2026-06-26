-- FitTrack Database Schema
-- Run this in Supabase SQL Editor

-- Weight logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nutrition logs (1 per day)
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  calories INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  is_cheat_day BOOLEAN DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout logs (1 per day per workout_day type)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  workout_day VARCHAR(3) NOT NULL, -- T2, T3, T4, T5, T6, T7
  completed BOOLEAN DEFAULT FALSE,
  duration_min INTEGER,
  exercises JSONB DEFAULT '[]'::jsonb, -- Array of ExerciseLog
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, workout_day)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_date ON nutrition_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(date DESC);

-- Enable Row Level Security (optional but recommended)
-- For a personal app, you can skip RLS or set permissive policies:
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations (single-user personal app)
CREATE POLICY "Allow all weight_logs" ON weight_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all nutrition_logs" ON nutrition_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all workout_logs" ON workout_logs FOR ALL USING (true) WITH CHECK (true);
