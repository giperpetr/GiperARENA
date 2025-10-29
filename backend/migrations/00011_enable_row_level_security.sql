-- +goose Up
-- +goose StatementBegin
-- Enable RLS on all tables
ALTER TABLE giperarena.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.betting_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON giperarena.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON giperarena.users
    FOR UPDATE USING (auth.uid() = id);

-- Wallets policies
CREATE POLICY "Users can view own wallet" ON giperarena.wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON giperarena.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON giperarena.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Arenas policies (public read, owner write)
CREATE POLICY "Anyone can view active arenas" ON giperarena.arenas
    FOR SELECT USING (status = 'active');

CREATE POLICY "Operators can manage own arenas" ON giperarena.arenas
    FOR ALL USING (auth.uid() = operator_id);

-- Game sessions policies
CREATE POLICY "Players can view own sessions" ON giperarena.game_sessions
    FOR SELECT USING (auth.uid() = player_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON giperarena.transactions
    FOR SELECT USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can view own profile" ON giperarena.users IS 'RLS: Users can only see their own profile data';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE giperarena.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.arenas DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.betting_markets DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.bets DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.nfts DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.leaderboards DISABLE ROW LEVEL SECURITY;
ALTER TABLE giperarena.notifications DISABLE ROW LEVEL SECURITY;
-- +goose StatementEnd
