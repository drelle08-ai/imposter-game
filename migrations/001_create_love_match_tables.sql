-- Love Match Game Tables

-- Game Rooms
CREATE TABLE IF NOT EXISTS love_match_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_code VARCHAR(6) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'lobby',
  round_number INT DEFAULT 0,
  current_phase VARCHAR(20) DEFAULT 'lobby',
  max_rounds INT DEFAULT 10,
  max_couples INT DEFAULT 8,
  timer_end_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE INDEX idx_love_match_rooms_code ON love_match_rooms(room_code);
CREATE INDEX idx_love_match_rooms_host ON love_match_rooms(host_id);
CREATE INDEX idx_love_match_rooms_status ON love_match_rooms(status);

-- Game Teams (Couples)
CREATE TABLE IF NOT EXISTS love_match_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES love_match_rooms(id) ON DELETE CASCADE,
  team_name VARCHAR(100) NOT NULL,
  player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_player1_hot_seat BOOLEAN DEFAULT true,
  total_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_love_match_teams_game ON love_match_teams(game_id);
CREATE INDEX idx_love_match_teams_player1 ON love_match_teams(player1_id);
CREATE INDEX idx_love_match_teams_player2 ON love_match_teams(player2_id);

-- Game Rounds
CREATE TABLE IF NOT EXISTS love_match_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES love_match_rooms(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  question_text TEXT NOT NULL,
  phase VARCHAR(20) NOT NULL DEFAULT 'question',
  hot_seat_player_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timer_end_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_love_match_rounds_game ON love_match_rounds(game_id);
CREATE INDEX idx_love_match_rounds_round ON love_match_rounds(game_id, round_number);

-- Answers (both hot seat and guesser)
CREATE TABLE IF NOT EXISTS love_match_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES love_match_rounds(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES love_match_teams(id) ON DELETE CASCADE,
  hot_seat_answer TEXT,
  guesser_answer TEXT,
  match_type VARCHAR(20) DEFAULT 'miss',
  points_awarded INT DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_love_match_answers_round ON love_match_answers(round_id);
CREATE INDEX idx_love_match_answers_team ON love_match_answers(team_id);

-- Scoring per round
CREATE TABLE IF NOT EXISTS love_match_round_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES love_match_rooms(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  team_id UUID NOT NULL REFERENCES love_match_teams(id) ON DELETE CASCADE,
  round_points INT DEFAULT 0,
  bonus_points INT DEFAULT 0,
  total_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_love_match_round_scores_game ON love_match_round_scores(game_id);
CREATE INDEX idx_love_match_round_scores_team ON love_match_round_scores(team_id);

-- Game Questions (per round)
CREATE TABLE IF NOT EXISTS love_match_game_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES love_match_rooms(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_love_match_game_questions_game ON love_match_game_questions(game_id);

-- Custom Questions (submitted by players)
CREATE TABLE IF NOT EXISTS love_match_custom_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES love_match_rooms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  submitted_by_team_id UUID REFERENCES love_match_teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_love_match_custom_questions_game ON love_match_custom_questions(game_id);

-- Game Results / Compatibility
CREATE TABLE IF NOT EXISTS love_match_game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES love_match_rooms(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES love_match_teams(id) ON DELETE CASCADE,
  final_points INT DEFAULT 0,
  exact_matches INT DEFAULT 0,
  close_matches INT DEFAULT 0,
  missed_matches INT DEFAULT 0,
  compatibility_score INT DEFAULT 0,
  placement INT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_love_match_game_results_game ON love_match_game_results(game_id);
CREATE INDEX idx_love_match_game_results_team ON love_match_game_results(team_id);

-- Enable Row Level Security (RLS) for public access (can be refined later)
ALTER TABLE love_match_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_match_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_match_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_match_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_match_round_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_match_game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_match_custom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_match_game_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users to access
CREATE POLICY "allow_authenticated_rooms" ON love_match_rooms
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "allow_authenticated_teams" ON love_match_teams
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "allow_authenticated_rounds" ON love_match_rounds
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "allow_authenticated_answers" ON love_match_answers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "allow_authenticated_scores" ON love_match_round_scores
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "allow_authenticated_questions" ON love_match_game_questions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "allow_authenticated_custom_questions" ON love_match_custom_questions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "allow_authenticated_results" ON love_match_game_results
  FOR ALL USING (auth.role() = 'authenticated');
