-- Baseline: the schema as Hibernate's ddl-auto generated it, before this project
-- moved to versioned migrations.
--
-- On an existing database this migration is skipped (spring.flyway.baseline-on-migrate
-- marks the current state as version 1). On a fresh database it runs and produces
-- exactly that same starting point, so both paths converge on V2 onwards.

CREATE TABLE users (
    id            VARCHAR(255)   NOT NULL,
    email         VARCHAR(255)   NOT NULL,
    password_hash VARCHAR(255)   NOT NULL,
    balance       NUMERIC(38, 2) NOT NULL,
    created_at    TIMESTAMP(6)   NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE holdings (
    id                 VARCHAR(255)   NOT NULL,
    user_id            VARCHAR(255)   NOT NULL,
    ticker             VARCHAR(255)   NOT NULL,
    shares             NUMERIC(38, 2) NOT NULL,
    avg_cost_per_share NUMERIC(38, 2) NOT NULL,
    CONSTRAINT holdings_pkey PRIMARY KEY (id),
    CONSTRAINT fk_holdings_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_holdings_user_ticker UNIQUE (user_id, ticker)
);

CREATE TABLE transactions (
    id            VARCHAR(255)   NOT NULL,
    user_id       VARCHAR(255)   NOT NULL,
    ticker        VARCHAR(255)   NOT NULL,
    type          VARCHAR(255)   NOT NULL,
    shares        NUMERIC(38, 2) NOT NULL,
    price_at_time NUMERIC(38, 2) NOT NULL,
    total_value   NUMERIC(38, 2) NOT NULL,
    "timestamp"   TIMESTAMP(6)   NOT NULL,
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT transactions_type_check CHECK (type IN ('BUY', 'SELL'))
);

CREATE TABLE pending_orders (
    id          VARCHAR(255)   NOT NULL,
    user_id     VARCHAR(255)   NOT NULL,
    ticker      VARCHAR(255)   NOT NULL,
    type        VARCHAR(255)   NOT NULL,
    shares      NUMERIC(38, 2) NOT NULL,
    limit_price NUMERIC(38, 2) NOT NULL,
    status      VARCHAR(255)   NOT NULL,
    created_at  TIMESTAMP(6)   NOT NULL,
    executed_at TIMESTAMP(6),
    CONSTRAINT pending_orders_pkey PRIMARY KEY (id),
    CONSTRAINT fk_pending_orders_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT pending_orders_type_check CHECK (type IN ('BUY', 'SELL')),
    CONSTRAINT pending_orders_status_check CHECK (status IN ('PENDING', 'EXECUTED', 'CANCELLED'))
);

CREATE TABLE price_alerts (
    id           VARCHAR(255)   NOT NULL,
    user_id      VARCHAR(255)   NOT NULL,
    ticker       VARCHAR(255)   NOT NULL,
    type         VARCHAR(255)   NOT NULL,
    target_price NUMERIC(38, 2) NOT NULL,
    active       BOOLEAN        NOT NULL,
    triggered_at TIMESTAMP(6),
    created_at   TIMESTAMP(6)   NOT NULL,
    CONSTRAINT price_alerts_pkey PRIMARY KEY (id),
    CONSTRAINT fk_price_alerts_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT price_alerts_type_check CHECK (type IN ('ABOVE', 'BELOW'))
);

CREATE TABLE watchlist (
    id           VARCHAR(255)   NOT NULL,
    user_id      VARCHAR(255)   NOT NULL,
    ticker       VARCHAR(255)   NOT NULL,
    notes        VARCHAR(500),
    target_price NUMERIC(38, 2),
    added_at     TIMESTAMP(6)   NOT NULL,
    CONSTRAINT watchlist_pkey PRIMARY KEY (id),
    CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_watchlist_user_ticker UNIQUE (user_id, ticker)
);
