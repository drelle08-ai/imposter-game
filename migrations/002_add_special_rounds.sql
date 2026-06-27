-- Add special rounds support to Love Match

-- Add columns to love_match_rounds
ALTER TABLE love_match_rounds
ADD COLUMN IF NOT EXISTS special_round_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_double_or_nothing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hot_streak_count INT DEFAULT 0;

-- Add columns to love_match_teams for tracking
ALTER TABLE love_match_teams
ADD COLUMN IF NOT EXISTS consecutive_exact_matches INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS can_double_or_nothing BOOLEAN DEFAULT TRUE;

-- Add audience guess tracking table
CREATE TABLE IF NOT EXISTS love_match_audience_guesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES love_match_rounds(id) ON DELETE CASCADE,
  guessing_team_id UUID NOT NULL REFERENCES love_match_teams(id) ON DELETE CASCADE,
  target_team_id UUID NOT NULL REFERENCES love_match_teams(id) ON DELETE CASCADE,
  guess_answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  bonus_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audience_guesses_round ON love_match_audience_guesses(round_id);
CREATE INDEX idx_audience_guesses_team ON love_match_audience_guesses(guessing_team_id);

-- Add host actions log
CREATE TABLE IF NOT EXISTS love_match_host_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES love_match_rooms(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  action_type VARCHAR(50),
  action_data JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_host_actions_game ON love_match_host_actions(game_id);

-- Update RLS for new tables
ALTER TABLE love_match_audience_guesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_match_host_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_authenticated_audience_guesses" ON love_match_audience_guesses
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "allow_authenticated_host_actions" ON love_match_host_actions
  FOR ALL USING (auth.role() = 'authenticated');
