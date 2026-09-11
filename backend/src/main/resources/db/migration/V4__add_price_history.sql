-- Recorded price points, used to draw a price chart per ticker.
--
-- There is no upstream source for this. Finnhub's free tier returns 403 for
-- /stock/candle, and the keyless alternatives now gate on browser challenges, so
-- the application records its own series from the quotes it already fetches.

CREATE TABLE price_history (
    id          VARCHAR(255)   NOT NULL,
    ticker      VARCHAR(255)   NOT NULL,
    price       NUMERIC(38, 2) NOT NULL,
    recorded_at TIMESTAMP(6)   NOT NULL,
    CONSTRAINT price_history_pkey PRIMARY KEY (id)
);

-- Every read is "the last N points for one ticker, newest first".
CREATE INDEX idx_price_history_ticker_time ON price_history (ticker, recorded_at DESC);

-- Seed from the transaction log so a chart has something to show immediately
-- rather than staying empty until enough snapshots accumulate. Each trade
-- already records the price at the moment it executed, which is a genuine
-- observation of that ticker's price at that time.
INSERT INTO price_history (id, ticker, price, recorded_at)
SELECT
    md5(random()::text || clock_timestamp()::text),
    ticker,
    price_at_time,
    "timestamp"
FROM transactions;
