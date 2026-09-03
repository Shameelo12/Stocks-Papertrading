# Paper Trading

[![CI](https://github.com/Shameelo12/Stocks-Papertrading/actions/workflows/ci.yml/badge.svg)](https://github.com/Shameelo12/Stocks-Papertrading/actions/workflows/ci.yml)

A full-stack stock trading simulator. Users start with $10,000 in virtual cash and can
place market and limit orders against live market prices, track positions and realized
performance, maintain watchlists, and set price alerts — with no real money involved.

Built as a learning project to work through the design of a transactional financial
system end to end: authentication, order execution, position accounting, and the
correctness problems that come with them.

---

## Features

**Trading**
- Market orders — execute immediately at the current quoted price
- Limit orders — held as pending and executed when the price crosses the limit
- Position-aware selling with share-count validation
- Weighted-average cost basis, recalculated on every additional purchase

**Portfolio**
- Live position valuation with unrealized gain/loss per holding
- Portfolio value history, computed in a single pass over the transaction log
- Full transaction history with per-trade detail

**Tracking**
- Watchlists with free-text notes and per-ticker price targets
- Price alerts that trigger above or below a threshold
- Trade analytics — win rate, best and worst performers, aggregate statistics

**Platform**
- JWT authentication with BCrypt password hashing
- Light and dark themes
- Responsive layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Material-UI 9, Recharts, Axios |
| Backend | Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA |
| Database | PostgreSQL |
| Auth | JWT (jjwt 0.12), BCrypt |
| Market data | Finnhub API |
| Testing | JUnit 5, Mockito, MockMvc, H2, JaCoCo |
| CI | GitHub Actions |

---

## Architecture

```
React SPA (:5173)
      │  Axios + Bearer token
      ▼
Spring Boot REST API (:8080)
      │
      ├── JwtAuthenticationFilter ─── stateless, validates token per request
      │
      ├── Controllers (9) ─────────── request handling, @Valid on DTOs
      │        │
      ├── Services (12) ───────────── business logic, @Transactional boundaries
      │        │
      ├── Repositories (6) ────────── Spring Data JPA
      │        ▼
      └── PostgreSQL ──────────────── users, holdings, transactions,
                                      pending_orders, price_alerts, watchlist
```

**Price resolution** is layered so the app stays usable without a live API key:

```
AlphaVantageService (facade)
        └─► FinnhubService ──── live quotes
                └─► MockPriceService ──── static prices for 25 common tickers
```

If Finnhub returns nothing — no key configured, rate limited, unknown symbol — the
request falls through to mock prices rather than failing the trade.

> **Note:** `AlphaVantageService` is a historical name. It performs no Alpha Vantage
> calls; it is purely the facade over the chain above.

---

## Getting Started

### Prerequisites

- JDK 17 or newer
- Node.js 20 or newer
- PostgreSQL 14 or newer
- Maven 3.8 or newer

### 1. Database

Create the database. Tables are generated automatically on first run
(`spring.jpa.hibernate.ddl-auto=update`).

```bash
createdb papertrading
```

### 2. Configuration

All configuration is read from environment variables, with the defaults below applied
when a variable is unset. See `backend/.env.example`.

| Variable | Default | Notes |
|---|---|---|
| `DB_HOST` | `localhost` | |
| `DB_PORT` | `5432` | |
| `DB_NAME` | `papertrading` | |
| `DB_USER` | `postgres` | |
| `DB_PASSWORD` | `postgres` | |
| `JWT_SECRET` | insecure placeholder | **Set this.** Minimum 256 bits. |
| `JWT_EXPIRATION` | `86400000` | Token lifetime, ms (24h) |
| `FINNHUB_API_KEY` | *(empty)* | Free key at [finnhub.io](https://finnhub.io). Without it the app uses mock prices. |

```bash
export JWT_SECRET="$(openssl rand -base64 48)"
export FINNHUB_API_KEY="your_key_here"
```

### 3. Backend

```bash
cd backend
mvn spring-boot:run
```

Serves on `http://localhost:8080`. Verify with `curl localhost:8080/api/health`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Serves on `http://localhost:5173`. Register a new account to get started — every new
user is seeded with $10,000.

---

## API Reference

All routes are prefixed `/api`. Everything except `/health`, `/auth/register`,
`/auth/login`, and `/stocks/**` requires an `Authorization: Bearer <token>` header.

### Authentication
| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/register` | Create an account, returns a JWT |
| `POST` | `/auth/login` | Authenticate, returns a JWT |

### Trading
| Method | Route | Description |
|---|---|---|
| `POST` | `/trade/buy` | Execute a market buy |
| `POST` | `/trade/sell` | Execute a market sell |

### Orders
| Method | Route | Description |
|---|---|---|
| `GET` | `/orders` | All orders (paginated) |
| `GET` | `/orders/pending` | Unfilled limit orders (paginated) |
| `POST` | `/orders` | Create a limit order |
| `POST` | `/orders/check-pending` | Evaluate pending orders against current prices |
| `DELETE` | `/orders/{orderId}` | Cancel a pending order |

### Portfolio
| Method | Route | Description |
|---|---|---|
| `GET` | `/portfolio` | Balance, positions, total value, gain/loss |
| `GET` | `/portfolio/transactions` | Transaction history (paginated) |
| `GET` | `/portfolio/history` | Portfolio value over time (paginated) |

### Watchlist
| Method | Route | Description |
|---|---|---|
| `GET` | `/watchlist` | Watchlist entries (paginated) |
| `POST` | `/watchlist` | Add a ticker |
| `PUT` | `/watchlist/{id}` | Update notes or target price |
| `DELETE` | `/watchlist/{id}` | Remove a ticker |

### Price Alerts
| Method | Route | Description |
|---|---|---|
| `GET` | `/price-alerts` | Alerts (paginated) |
| `POST` | `/price-alerts` | Create an `ABOVE` or `BELOW` alert |
| `DELETE` | `/price-alerts/{alertId}` | Delete an alert |

### Stocks & Misc
| Method | Route | Description |
|---|---|---|
| `GET` | `/stocks/{ticker}/price` | Current quote |
| `GET` | `/stocks/search` | Symbol search |
| `GET` | `/stocks/suggestions` | Autocomplete suggestions |
| `GET` | `/analytics/stats` | Trade statistics |
| `GET` | `/health` | Health check |

Paginated endpoints accept `?offset=` and `?limit=` and return
`{ data, offset, limit, total, totalPages, hasMore }`.

---

## Testing

```bash
cd backend
mvn test
```

18 tests — unit tests for `AuthService` and `TradeService` (Mockito), and integration
tests for the auth flow (MockMvc against H2 in-memory). CI runs the suite plus a
frontend production build on every push and pull request to `main`.

A JaCoCo report is written to `backend/target/site/jacoco/index.html` after a test run.
Coverage is concentrated where correctness matters most:

| Component | Line coverage |
|---|---|
| `AuthService` | 100% |
| `TradeService` | 80% |
| Overall | 26% |

The remaining services (orders, portfolio, analytics, watchlist, alerts) are not yet
covered.

---

## Project Structure

```
backend/
  src/main/java/com/papertrading/
    config/       Spring Security, JWT filter and utilities
    controller/   REST endpoints, global exception handler
    dto/          Request/response objects with Bean Validation
    model/        JPA entities
    repository/   Spring Data repositories
    service/      Business logic
  src/test/       Unit and integration tests

frontend/
  src/
    api/          Axios instance and interceptors
    components/   Navbar, Sidebar, Layout, ErrorBoundary, dialogs
    context/      Auth and theme providers
    hooks/        usePortfolio
    pages/        Dashboard, Trade, Portfolio, Watchlist, History, Analytics, Settings
```

---

## Limitations

This is a portfolio project, and it is honest about what it is not:

- **Not deployed.** It runs locally; there is no hosted instance.
- **No rate limiting** on the API.
- **No real order book.** Market orders fill instantly at the quoted price with no
  slippage, spread, or partial fills. Limit orders are evaluated on demand rather than
  by a background scheduler.
- **Mock prices are static.** When Finnhub is unavailable, the fallback prices do not
  move, so gain/loss will not change.
- **Coverage is partial** — see the table above.

---

## License

Not currently licensed for reuse.
