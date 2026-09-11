-- Adds optimistic locking and a per-account performance baseline to users.
--
-- These two columns are why this project now has migrations at all. Hibernate's
-- ddl-auto=update tried to add them as NOT NULL, which Postgres refuses on a table
-- that already has rows. It logged a warning and carried on, so the application
-- started successfully and then returned 500 on every request touching users —
-- the entity referenced columns that did not exist.
--
-- Doing it in three steps is what makes it safe on a populated table:
-- add nullable, backfill, then tighten.

ALTER TABLE users ADD COLUMN version BIGINT;
ALTER TABLE users ADD COLUMN starting_balance NUMERIC(38, 2);

-- Existing accounts all opened with the hardcoded 10000.00 that was baked into
-- the User constructor before the amount became configurable, so that is their
-- true starting balance.
UPDATE users SET version = 0 WHERE version IS NULL;
UPDATE users SET starting_balance = 10000.00 WHERE starting_balance IS NULL;

ALTER TABLE users ALTER COLUMN version SET NOT NULL;
ALTER TABLE users ALTER COLUMN starting_balance SET NOT NULL;
