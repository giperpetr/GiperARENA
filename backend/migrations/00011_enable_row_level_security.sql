-- +goose Up
-- +goose StatementBegin
-- Enable RLS on all tables
ALTER TABLE arenahub.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.betting_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON arenahub.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON arenahub.users
    FOR UPDATE USING (auth.uid() = id);

-- Wallets policies
CREATE POLICY "Users can view own wallet" ON arenahub.wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON arenahub.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON arenahub.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Arenas policies (public read, owner write)
CREATE POLICY "Anyone can view active arenas" ON arenahub.arenas
    FOR SELECT USING (status = 'active');

CREATE POLICY "Operators can manage own arenas" ON arenahub.arenas
    FOR ALL USING (auth.uid() = operator_id);

-- Game sessions policies
CREATE POLICY "Players can view own sessions" ON arenahub.game_sessions
    FOR SELECT USING (auth.uid() = player_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON arenahub.transactions
    FOR SELECT USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can view own profile" ON arenahub.users IS 'RLS: Users can only see their own profile data';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE arenahub.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.arenas DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.betting_markets DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.bets DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.nfts DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.leaderboards DISABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.notifications DISABLE ROW LEVEL SECURITY;
-- +goose StatementEnd
