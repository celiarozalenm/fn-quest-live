-- Forward Quest Database Schema

-- Quests table
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  mission TEXT NOT NULL,
  achievements TEXT,
  is_active BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Levels table
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quest_id, level_number)
);

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  description TEXT,
  hint_1 TEXT,
  hint_2 TEXT,
  hint_3 TEXT,
  solution TEXT NOT NULL,
  input_type TEXT DEFAULT 'text' CHECK (input_type IN ('text', 'dropdown')),
  correct_answer TEXT NOT NULL,
  dropdown_options JSONB,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results table (leaderboard entries)
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  quest_id UUID NOT NULL REFERENCES quests(id),
  level_id UUID NOT NULL REFERENCES levels(id),
  initials CHAR(3) NOT NULL,
  time_seconds INTEGER NOT NULL,
  hints_used INTEGER DEFAULT 0,
  clicked_solution BOOLEAN DEFAULT false,
  eligible_for_leaderboard BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, quest_id, level_id)
);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_levels_quest_id ON levels(quest_id);
CREATE INDEX idx_challenges_level_id ON challenges(level_id);
CREATE INDEX idx_results_quest_level ON results(quest_id, level_id);
CREATE INDEX idx_results_leaderboard ON results(quest_id, level_id, eligible_for_leaderboard, time_seconds);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_quests_updated_at
  BEFORE UPDATE ON quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_levels_updated_at
  BEFORE UPDATE ON levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public read policies for quests/levels/challenges
CREATE POLICY "Allow public read for active quests"
  ON quests FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow public read for levels of active quests"
  ON levels FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quests WHERE quests.id = levels.quest_id AND quests.is_active = true
  ));

CREATE POLICY "Allow public read for challenges"
  ON challenges FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM levels
    JOIN quests ON quests.id = levels.quest_id
    WHERE levels.id = challenges.level_id AND quests.is_active = true
  ));

-- Results policies
CREATE POLICY "Allow public insert for results"
  ON results FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read for leaderboard results"
  ON results FOR SELECT
  USING (eligible_for_leaderboard = true);

-- Admin policies (these will need service role for full access)
CREATE POLICY "Admins can read all quests"
  ON quests FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can manage levels"
  ON levels FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can manage challenges"
  ON challenges FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = current_setting('request.jwt.claims', true)::json->>'email'));
