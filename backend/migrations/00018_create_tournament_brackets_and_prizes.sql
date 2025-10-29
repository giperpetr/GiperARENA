-- +goose Up
-- +goose StatementBegin
-- Tournament brackets for tracking matches
CREATE TABLE IF NOT EXISTS giperarena.tournament_brackets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES giperarena.tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL CHECK (round_number > 0),
    match_number INTEGER NOT NULL CHECK (match_number > 0),
    participant1_id UUID REFERENCES giperarena.tournament_participants(id) ON DELETE SET NULL,
    participant2_id UUID REFERENCES giperarena.tournament_participants(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES giperarena.tournament_participants(id) ON DELETE SET NULL,
    session_id UUID REFERENCES giperarena.game_sessions(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    match_status VARCHAR(20) DEFAULT 'pending' CHECK (match_status IN (
        'pending', 'in_progress', 'completed', 'cancelled', 'bye'
    )),
    participant1_score INTEGER DEFAULT 0,
    participant2_score INTEGER DEFAULT 0,
    best_of INTEGER DEFAULT 1 CHECK (best_of > 0),
    arena_id UUID REFERENCES giperarena.arenas(id) ON DELETE SET NULL,
    device_id UUID REFERENCES giperarena.devices(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_tournament_match UNIQUE (tournament_id, round_number, match_number)
);

-- Prize pool and distribution
CREATE TABLE IF NOT EXISTS giperarena.tournament_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES giperarena.tournaments(id) ON DELETE CASCADE,
    place INTEGER NOT NULL CHECK (place > 0),
    prize_type VARCHAR(20) NOT NULL CHECK (prize_type IN (
        'pac', 'gac', 'nft', 'physical', 'mixed'
    )),
    pac_amount DECIMAL(20, 2) DEFAULT 0 CHECK (pac_amount >= 0),
    gac_amount DECIMAL(20, 8) DEFAULT 0 CHECK (gac_amount >= 0),
    nft_id UUID REFERENCES giperarena.nfts(id) ON DELETE SET NULL,
    physical_prize_description TEXT,
    winner_id UUID REFERENCES giperarena.users(id) ON DELETE SET NULL,
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMPTZ,
    transaction_id UUID REFERENCES giperarena.transactions(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_tournament_place UNIQUE (tournament_id, place)
);

-- Indexes for tournament_brackets
CREATE INDEX idx_tournament_brackets_tournament_id ON giperarena.tournament_brackets(tournament_id);
CREATE INDEX idx_tournament_brackets_round_number ON giperarena.tournament_brackets(round_number);
CREATE INDEX idx_tournament_brackets_participant1_id ON giperarena.tournament_brackets(participant1_id) WHERE participant1_id IS NOT NULL;
CREATE INDEX idx_tournament_brackets_participant2_id ON giperarena.tournament_brackets(participant2_id) WHERE participant2_id IS NOT NULL;
CREATE INDEX idx_tournament_brackets_winner_id ON giperarena.tournament_brackets(winner_id) WHERE winner_id IS NOT NULL;
CREATE INDEX idx_tournament_brackets_session_id ON giperarena.tournament_brackets(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_tournament_brackets_match_status ON giperarena.tournament_brackets(match_status);
CREATE INDEX idx_tournament_brackets_scheduled_at ON giperarena.tournament_brackets(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Indexes for tournament_prizes
CREATE INDEX idx_tournament_prizes_tournament_id ON giperarena.tournament_prizes(tournament_id);
CREATE INDEX idx_tournament_prizes_place ON giperarena.tournament_prizes(place);
CREATE INDEX idx_tournament_prizes_winner_id ON giperarena.tournament_prizes(winner_id) WHERE winner_id IS NOT NULL;
CREATE INDEX idx_tournament_prizes_claimed ON giperarena.tournament_prizes(claimed) WHERE claimed = false;
CREATE INDEX idx_tournament_prizes_prize_type ON giperarena.tournament_prizes(prize_type);

-- Function to generate tournament bracket
CREATE OR REPLACE FUNCTION giperarena.generate_tournament_bracket(p_tournament_id UUID)
RETURNS void AS $$
DECLARE
    v_participant_count INTEGER;
    v_rounds INTEGER;
    v_matches_per_round INTEGER;
    v_current_round INTEGER := 1;
    v_participants UUID[];
BEGIN
    -- Get all participants
    SELECT ARRAY_AGG(id ORDER BY RANDOM())
    INTO v_participants
    FROM giperarena.tournament_participants
    WHERE tournament_id = p_tournament_id
    AND status = 'registered';

    v_participant_count := ARRAY_LENGTH(v_participants, 1);

    IF v_participant_count < 2 THEN
        RAISE EXCEPTION 'Not enough participants to create bracket';
    END IF;

    -- Calculate number of rounds (log2 of next power of 2)
    v_rounds := CEIL(LOG(2, v_participant_count));
    v_matches_per_round := POWER(2, v_rounds - 1);

    -- Create first round matches
    FOR i IN 1..v_matches_per_round LOOP
        INSERT INTO giperarena.tournament_brackets (
            tournament_id,
            round_number,
            match_number,
            participant1_id,
            participant2_id,
            match_status
        ) VALUES (
            p_tournament_id,
            1,
            i,
            v_participants[i * 2 - 1],
            v_participants[i * 2],
            CASE
                WHEN v_participants[i * 2] IS NULL THEN 'bye'
                ELSE 'pending'
            END
        );
    END LOOP;

    -- Create empty matches for subsequent rounds
    FOR round IN 2..v_rounds LOOP
        v_matches_per_round := v_matches_per_round / 2;
        FOR i IN 1..v_matches_per_round LOOP
            INSERT INTO giperarena.tournament_brackets (
                tournament_id,
                round_number,
                match_number,
                match_status
            ) VALUES (
                p_tournament_id,
                round,
                i,
                'pending'
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to advance winner to next round
CREATE OR REPLACE FUNCTION giperarena.advance_tournament_winner()
RETURNS TRIGGER AS $$
DECLARE
    v_next_round INTEGER;
    v_next_match INTEGER;
    v_is_participant1 BOOLEAN;
BEGIN
    IF NEW.match_status = 'completed' AND NEW.winner_id IS NOT NULL THEN
        v_next_round := NEW.round_number + 1;
        v_next_match := CEIL(NEW.match_number::DECIMAL / 2);

        -- Determine if winner goes to participant1 or participant2 slot
        v_is_participant1 := (NEW.match_number % 2 = 1);

        IF v_is_participant1 THEN
            UPDATE giperarena.tournament_brackets
            SET participant1_id = NEW.winner_id
            WHERE tournament_id = NEW.tournament_id
            AND round_number = v_next_round
            AND match_number = v_next_match;
        ELSE
            UPDATE giperarena.tournament_brackets
            SET participant2_id = NEW.winner_id
            WHERE tournament_id = NEW.tournament_id
            AND round_number = v_next_round
            AND match_number = v_next_match;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_advance_tournament_winner
    AFTER UPDATE ON giperarena.tournament_brackets
    FOR EACH ROW
    WHEN (NEW.winner_id IS NOT NULL AND OLD.winner_id IS DISTINCT FROM NEW.winner_id)
    EXECUTE FUNCTION giperarena.advance_tournament_winner();

COMMENT ON TABLE giperarena.tournament_brackets IS 'Tournament bracket structure with matches and rounds';
COMMENT ON TABLE giperarena.tournament_prizes IS 'Prize pool and distribution for tournament placements';
COMMENT ON COLUMN giperarena.tournament_brackets.round_number IS 'Round number (1 = first round, final round = log2(participants))';
COMMENT ON COLUMN giperarena.tournament_brackets.match_number IS 'Match number within the round';
COMMENT ON COLUMN giperarena.tournament_brackets.best_of IS 'Best of N games (1, 3, 5, 7, etc.)';
COMMENT ON COLUMN giperarena.tournament_brackets.match_status IS 'bye = one participant advances automatically';
COMMENT ON COLUMN giperarena.tournament_prizes.prize_type IS 'Type of prize (PAC tokens, GAC tokens, NFT, physical item, or mixed)';
COMMENT ON COLUMN giperarena.tournament_prizes.claimed IS 'Whether winner has claimed the prize';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_advance_tournament_winner ON giperarena.tournament_brackets;
DROP FUNCTION IF EXISTS giperarena.generate_tournament_bracket(UUID);
DROP FUNCTION IF EXISTS giperarena.advance_tournament_winner();
DROP TABLE IF EXISTS giperarena.tournament_prizes CASCADE;
DROP TABLE IF EXISTS giperarena.tournament_brackets CASCADE;
-- +goose StatementEnd
