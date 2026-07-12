# Shortlet

A TypeScript/Express REST API that mirrors [REST Countries](https://restcountries.com) data into PostgreSQL and exposes it through indexed, paginated, Redis-cached endpoints (countries, regions, languages, aggregate statistics), behind JWT auth.

## Architecture

```
                 ┌────────────┐   /api/migrate   ┌──────────────────┐
                 │  REST       │ ───────────────▶ │ externalApiService│
                 │  Countries  │                  │  (upsert)         │
                 │  API        │                  └─────────┬────────┘
                 └────────────┘                              │
                                                               ▼
Client ──▶ Express ──▶ rate limit / helmet / compression ──▶ Postgres ("countryData")
                              │                                 ▲
                              ▼                                 │
                        countryService  ◀── cache-aside ──▶ Redis
```

**Reads never touch the external API.** `GET /api/countries`, `/countries/:code`, `/regions`, `/languages` and `/statistics` all run indexed queries against Postgres, with Redis as a cache-aside layer (`countryService.ts`). The external REST Countries API is only ever called by `POST /api/migrate`, which bulk-upserts the latest data into Postgres. This keeps the read path fast and independent of a third party's uptime, and lets it scale with normal DB/cache scaling techniques instead of being bottlenecked by an outside API.

## Tech stack

- **Runtime**: Node.js, TypeScript, Express
- **Database**: PostgreSQL via Sequelize (indexed, pooled connections)
- **Cache**: Redis (cache-aside, best-effort — a Redis outage degrades to DB-only instead of failing requests)
- **Auth**: JWT (`jsonwebtoken`), bcrypt password hashing, Zod request validation
- **Hardening**: Helmet, gzip compression, rate limiting, request size limits, graceful shutdown, liveness/readiness probes
- **Docs**: OpenAPI/Swagger at `/api-docs` (generated via `swagger-autogen`)

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 6+

(Or skip the two above and use `docker compose up`, see [Running with Docker](#running-with-docker).)

### Environment variables

Copy `.env.sample` to `.env` and fill in your values:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development` \| `test` \| `production` |
| `DB_HOST` | yes | — | Postgres host |
| `DB_PORT` | no | `5432` | Postgres port |
| `DB_USER` | yes | — | Postgres user |
| `DB_PASSWORD` | yes | — | Postgres password |
| `DB_NAME` | yes | — | Postgres database name |
| `DB_SSL` | no | `false` | Set `true` for hosted Postgres requiring SSL (RDS, Heroku, etc.) |
| `DB_POOL_MAX` | no | `10` | Max pooled connections *per app instance* |
| `DB_POOL_MIN` | no | `2` | Min pooled connections kept warm |
| `JWT_SECRET_KEY` | yes | — | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | yes | — | e.g. `1h`, `7d` |
| `PORT` | no | `8080` | HTTP port |
| `API_URL` | yes | — | REST Countries base URL (only used by `/api/migrate`) |
| `REDIS_URL` | no | `redis://localhost:6379` | Redis connection string |
| `LOG_LEVEL` | no | `info` | Winston log level |

Missing required variables fail the process at boot (see `src/config/env.ts`) rather than failing deep inside a request handler.

### Run locally (native)

```bash
npm install
npm run build           # compiles src -> dist
npm run migrate          # creates/updates the countryData & users tables + indexes
npm run dev               # ts-node + nodemon, for local development
# or, to run the compiled build:
npm start
```

### Running with Docker

```bash
docker compose up --build
```

This starts the app, Postgres, and Redis together, with healthchecks gating startup order. Run migrations against the compose stack with:

```bash
docker compose exec app npm run migrate
```

Scale the API horizontally (it's stateless — all state lives in Postgres/Redis):

```bash
docker compose up --scale app=3
```
(put a load balancer in front to distribute traffic across replicas)

### Populate the database

Once the server is running, trigger a data pull from REST Countries into Postgres:

```bash
curl -X POST http://localhost:8080/api/migrate
```

This is a bulk **upsert** keyed on `alpha3Code` (unique-indexed) — safe to re-run any time to refresh data; it will not create duplicate rows.

> **Known limitation:** REST Countries has deprecated the `v3.1` API this project targets, in favor of `v5`. Until `API_URL`/`externalApiService.ts` are updated to the new contract, `/api/migrate` will fail against the live service. Reads (`/countries`, `/regions`, etc.) are unaffected as long as Postgres already has data from a prior successful migration.

## Scaling notes

- **DB reads are indexed and paginated at the query level** (`LIMIT`/`OFFSET`/`WHERE`), not filtered/sliced in application memory — indexes exist on `alpha3Code` (unique), `alpha2Code`, `region`, and `population`.
- **Connection pooling** is configured (`DB_POOL_MAX`/`DB_POOL_MIN`) instead of relying on Sequelize's defaults, and SQL logging is disabled outside development.
- **Redis caching is cache-aside and best-effort**: a Redis outage degrades to direct-DB reads rather than 500ing requests.
- **The app is stateless** — no in-memory session state — so it scales horizontally behind a load balancer; Postgres and Redis are the only shared state.
- **Rate limiting** protects the API generally (100 req/min/IP) and `POST /api/migrate` specifically (2 req/min/IP), since that endpoint triggers an expensive external fetch + bulk DB write and has no auth in front of it.
- **Compression** (gzip) and a bounded JSON body size (1MB) reduce bandwidth and cap request cost.
- **Liveness/readiness endpoints** (`/health`, `/ready`) let load balancers and orchestrators (k8s, ECS, etc.) route traffic only to instances that can actually reach Postgres and Redis.
- **Graceful shutdown** on `SIGTERM`/`SIGINT` stops accepting new connections and closes DB/Redis connections cleanly, so rolling deploys/restarts don't drop in-flight requests.

## API reference

Base URL: `http://localhost:8080` (or your `PORT`/deployment host)

All `/api/*` routes except `/api/auth/*` and `POST /api/migrate` require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/create` | no | Create a user. Body: `{ username, email, password, role? }` |
| POST | `/api/auth/login` | no | Log in. Body: `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/` | no | List all users |
| POST | `/api/auth/logout` | no | Clear the client's token cookie |

### Countries

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/migrate` | no (rate-limited) | Pull all countries from REST Countries and upsert into Postgres |
| GET | `/api/countries` | yes | Paginated countries. Query: `page`, `limit`, `region`, `population`, `fields` (comma-separated column projection) |
| GET | `/api/countries/:code` | yes | Single country by alpha-2 or alpha-3 code (case-insensitive). 404 if not found |
| GET | `/api/regions` | yes | Regions with member countries and total population, paginated by region. Query: `page`, `limit` |
| GET | `/api/languages` | yes | Languages with speaking countries and total speakers, paginated by language. Query: `page`, `limit` |
| GET | `/api/statistics` | yes | Global aggregate: total countries, largest by area, smallest by population, most widely spoken language |

### Ops

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | no | Liveness — process is up |
| GET | `/ready` | no | Readiness — checks Postgres + Redis, `200`/`503` |
| GET | `/api-docs` | no | Swagger UI |

## Database migrations

```bash
npm run migration:generate -- --name my-migration   # scaffold a new migration
npm run migrate                                      # apply pending migrations
npm run seed                                          # run seeders, if any
```

Migrations live in `src/db/migrations`; Sequelize CLI config is `src/db/config/config.js` (reads the same env vars as the app).

## Project structure

```
src/
  app.ts               Express app: middleware, routes, error handling
  index.ts             Process entrypoint: boot, connections, graceful shutdown
  config/env.ts         Startup env validation (zod)
  controllers/          Request/response handling
  services/
    externalApiService.ts   External REST Countries API + migration/upsert
    countryService.ts       DB-backed, Redis-cached reads
  db/
    sequelize.ts         Sequelize instance (pool, SSL, logging)
    redisClient.ts        Redis client (reconnect strategy)
    models/                Sequelize models
    migrations/            Sequelize migrations
  middleware/            auth (JWT), rate limiting
  utils/
    cache.ts              Safe Redis get/set wrapper (best-effort)
    logger.ts              Winston logger
    helpers.ts              JWT signing
  validation/            Zod request schemas
  routes/                 Express routers
```

## License

See [LICENSE](./LICENSE).
