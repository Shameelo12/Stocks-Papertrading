-- Indexes for the access patterns this application actually has.
--
-- Every read is scoped to one user, so the foreign key columns carry the load,
-- and Postgres does not index foreign keys automatically. The two schedulers add
-- a second pattern: sweeping by status across all users.
--
-- Separate from V1 rather than part of it, because V1 is a baseline that an
-- existing database skips. Putting these here means both a fresh database and
-- one adopted from ddl-auto end up with the same indexes.

-- Portfolio, history and analytics all read one user's rows.
CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_pending_orders_user ON pending_orders (user_id);

-- Transaction history is always read newest-first for one user, and the portfolio
-- history rebuild sorts the whole set by time. A composite matching that ordering
-- lets the index satisfy both the filter and the sort.
CREATE INDEX IF NOT EXISTS idx_transactions_user_timestamp
    ON transactions (user_id, "timestamp" DESC);

-- The scheduled sweeps query by status and active flag across all users, so these
-- cannot rely on the user_id indexes above.
CREATE INDEX IF NOT EXISTS idx_pending_orders_status ON pending_orders (status);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts (active);
