-- Migration: Add challenge_fields table and update challenges structure
-- This allows challenges to have multiple input/dropdown fields

-- Create challenge_fields table for multiple inputs per challenge
CREATE TABLE challenge_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'dropdown')),
  label TEXT, -- Optional label for the field
  correct_answer TEXT NOT NULL,
  dropdown_options JSONB, -- Array of options for dropdown type
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hints table for ordered hints per challenge
CREATE TABLE challenge_hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  hint_text TEXT NOT NULL,
  "order" INTEGER NOT NULL, -- 1, 2, 3 for progressive reveal
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, "order")
);

-- Add level_name to levels table for custom names (Beginner, Intermediate, Expert, etc.)
ALTER TABLE levels ADD COLUMN IF NOT EXISTS name TEXT;

-- Remove old hint columns and single input fields from challenges (after data migration)
-- For now, keep them for backwards compatibility
-- ALTER TABLE challenges DROP COLUMN IF EXISTS hint_1;
-- ALTER TABLE challenges DROP COLUMN IF EXISTS hint_2;
-- ALTER TABLE challenges DROP COLUMN IF EXISTS hint_3;
-- ALTER TABLE challenges DROP COLUMN IF EXISTS input_type;
-- ALTER TABLE challenges DROP COLUMN IF EXISTS correct_answer;
-- ALTER TABLE challenges DROP COLUMN IF EXISTS dropdown_options;

-- Indexes
CREATE INDEX idx_challenge_fields_challenge_id ON challenge_fields(challenge_id);
CREATE INDEX idx_challenge_hints_challenge_id ON challenge_hints(challenge_id);

-- Updated_at trigger for challenge_fields
CREATE TRIGGER update_challenge_fields_updated_at
  BEFORE UPDATE ON challenge_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS for challenge_fields
ALTER TABLE challenge_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_hints ENABLE ROW LEVEL SECURITY;

-- Public read for challenge_fields (same rules as challenges)
CREATE POLICY "Allow public read for challenge_fields"
  ON challenge_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM challenges
    JOIN levels ON levels.id = challenges.level_id
    JOIN quests ON quests.id = levels.quest_id
    WHERE challenges.id = challenge_fields.challenge_id AND quests.is_active = true
  ));

CREATE POLICY "Allow public read for challenge_hints"
  ON challenge_hints FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM challenges
    JOIN levels ON levels.id = challenges.level_id
    JOIN quests ON quests.id = levels.quest_id
    WHERE challenges.id = challenge_hints.challenge_id AND quests.is_active = true
  ));

-- Admin policies for new tables
CREATE POLICY "Admins can manage challenge_fields"
  ON challenge_fields FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can manage challenge_hints"
  ON challenge_hints FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass for quests"
  ON quests FOR ALL
  USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role bypass for levels"
  ON levels FOR ALL
  USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role bypass for challenges"
  ON challenges FOR ALL
  USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role bypass for challenge_fields"
  ON challenge_fields FOR ALL
  USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role bypass for challenge_hints"
  ON challenge_hints FOR ALL
  USING (current_setting('role') = 'service_role');
