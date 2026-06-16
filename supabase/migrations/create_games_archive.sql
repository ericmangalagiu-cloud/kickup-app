-- Run this once in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → paste this → Run

CREATE TABLE IF NOT EXISTS games_archive (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id          uuid,
  name                 text,
  location             text,
  city                 text,
  date                 date,
  start_time           text,
  end_time             text,
  level                text,
  num_teams            integer,
  players_per_team     integer,
  price                text,
  is_private           boolean DEFAULT false,
  organizer_name       text,
  organizer_session_id text,
  players_count        integer DEFAULT 0,
  archived_at          timestamptz DEFAULT now()
);

-- Allow the app (anon key) to insert + read from this table
ALTER TABLE games_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert archive rows"
  ON games_archive FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read archive rows"
  ON games_archive FOR SELECT
  USING (true);
