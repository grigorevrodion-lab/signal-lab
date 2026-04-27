# Signal Lab

Observability playground — click a button in the UI, see the result in Grafana, Loki, and Sentry within 30 seconds.

## Prerequisites

- Docker Desktop 4.x+ with Compose v2
- Git

## Quick Start

```bash
git clone <repo-url> signal-lab && cd signal-lab

cp .env.example .env
# Optional: add SENTRY_DSN=https://... to .env for Sentry captures

docker compose up -d
```

Wait ~30 seconds for all services to become healthy, then:

| Service | URL |
|---------|-----|
| UI | http://localhost:3000 |
| API + Swagger | http://localhost:3001/api/docs |
| Prometheus metrics | http://localhost:3001/metrics |
| Grafana | http://localhost:3100 (admin / admin) |
| Loki (via Grafana) | http://localhost:3100/explore |
| Prometheus UI | http://localhost:9090 |

## Stop

```bash
docker compose down
# Remove volumes (clears all data):
docker compose down -v
```

---

## Verification Walkthrough

Complete this in 5 minutes to verify everything works.

### 1. UI loads
Open http://localhost:3000 — you should see the "Signal Lab" header, a "Run Scenario" form, and empty "Run History".

### 2. Run scenarios

In the UI, run each of these and observe the badge color in Run History:

| Scenario | Expected badge | Expected toast |
|----------|---------------|----------------|
| `success` | Green "OK" | "Run completed in Xms" |
| `validation_error` | Yellow "Invalid" | "Run failed" + 400 message |
| `system_error` | Red "Error" | "Run failed" + 500 message |
| `slow_request` | Green "OK" after 2–5s | "Run completed in Xs" |
| `teapot` | Cyan "418" | "Teapot! Signal: 42" |

### 3. Verify Prometheus metrics

```
open http://localhost:3001/metrics
```

Search for:
- `scenario_runs_total` — should show counts with `type` and `status` labels
- `scenario_run_duration_seconds_count` — histogram counts
- `http_requests_total` — HTTP request counts

### 4. Verify Grafana dashboard

Open http://localhost:3100 → login with `admin / admin`

Go to **Dashboards → Signal Lab → Signal Lab**.

You should see 5 panels:
- "Scenario Runs by Type" — time series with colored lines per scenario type
- "Error Rate" — time series, red line for `failed` status
- "Latency Distribution (P50 / P95 / P99)" — after `slow_request`, p99 spikes to 5s
- "HTTP Requests Total" — all API calls
- "Application Logs (Loki)" — JSON log entries from the backend

### 5. Verify Loki logs

In Grafana: **Explore → datasource: Loki**

Run query: `{app="signal-lab"}`

You should see structured JSON logs with fields: `level`, `msg`, `scenarioType`, `scenarioId`, `duration`.

Filter by scenario type: `{app="signal-lab"} | json | scenarioType="system_error"`

### 6. Verify Sentry (requires DSN)

If `SENTRY_DSN` is set in `.env`:
- Run `system_error` scenario
- Open your Sentry project — a new exception `Unhandled system exception in scenario execution` should appear within 30s

---

## Architecture

```
localhost:3000  →  Next.js frontend (shadcn/ui, TanStack Query, RHF)
localhost:3001  →  NestJS backend (Prisma/PG, prom-client, pino, Sentry)
localhost:9090  →  Prometheus (scrapes backend /metrics every 5s)
localhost:3100  →  Grafana (dashboards: Prometheus + Loki datasources)
localhost:3200  →  Loki (receives logs from Promtail)
                   Promtail (reads Docker container logs → Loki)
                   PostgreSQL (stores ScenarioRun records)
```

## Scenario Types

| Type | HTTP status | Signal |
|------|------------|--------|
| `success` | 200 | metric++, log info, PG row |
| `validation_error` | 400 | metric++, log warn, Sentry breadcrumb |
| `system_error` | 500 | metric++, log error, Sentry exception |
| `slow_request` | 200 (after 2–5s) | metric++, histogram spike, log warn |
| `teapot` | 418 🫖 | signal: 42, easter egg metadata |

## Development

```bash
# Backend only (requires local PG)
cd apps/backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev

# Frontend only
cd apps/frontend
cp .env.example .env
npm install
npm run dev
```

## AI Layer

See [AI_LAYER.md](./AI_LAYER.md) for documentation on Cursor skills, rules, commands, and hooks.
