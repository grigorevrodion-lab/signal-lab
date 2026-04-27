# Signal Lab — Submission Checklist

---

## Repository

- **URL**: `https://github.com/<your-username>/signal-lab`
- **Branch**: `main`
- **Time worked**: ~8 hours

**Started**: [fill in time]
**Completed**: [fill in time]

---

## Launch

```bash
# Start everything:
docker compose up -d

# Verify health:
docker compose ps

# Stop:
docker compose down

# Stop + remove data:
docker compose down -v
```

**Prerequisites**: Docker Desktop 4.x+ with Compose v2, Git. No Node.js required to run.

---

## Stack — Confirmation

| Technology | Used? | Where to look |
|-----------|:------:|---------------|
| Next.js (App Router) | ✅ | `apps/frontend/src/app/` — layout.tsx, page.tsx |
| shadcn/ui | ✅ | `apps/frontend/src/components/ui/` — button, badge, card, input, select |
| Tailwind CSS | ✅ | `apps/frontend/tailwind.config.ts`, `globals.css` |
| TanStack Query | ✅ | `run-history.tsx` (useQuery), `scenario-runner.tsx` (useMutation) |
| React Hook Form | ✅ | `scenario-runner.tsx` — useForm + zodResolver |
| NestJS | ✅ | `apps/backend/src/` — modules, controllers, services |
| PostgreSQL | ✅ | `docker-compose.yml` postgres service |
| Prisma | ✅ | `apps/backend/prisma/schema.prisma`, PrismaService |
| Sentry | ✅ | `scenario.service.ts` — captureException, addBreadcrumb |
| Prometheus | ✅ | `metrics.registry.ts` — 3 metrics, exposed at GET /metrics |
| Grafana | ✅ | `monitoring/grafana/dashboards/signal-lab.json` — 5 panels, provisioned |
| Loki | ✅ | `docker-compose.yml`, Promtail ships backend logs |

---

## Observability Verification

| Signal | How to reproduce | Where to see result |
|--------|-----------------|---------------------|
| Prometheus metric | Run any scenario in UI | `http://localhost:3001/metrics` → search `scenario_runs_total` |
| Grafana dashboard | Run several scenarios, wait 15s | `http://localhost:3100` → Signal Lab dashboard |
| Loki log | Run any scenario | Grafana → Explore → Loki → `{app="signal-lab"}` |
| Sentry exception | Run `system_error` scenario (requires SENTRY_DSN) | Sentry project dashboard |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Purpose |
|---|-----------|---------|
| 1 | `add-observability` | Step-by-step guide for adding metrics + logging + Sentry to any endpoint |
| 2 | `add-nestjs-endpoint` | Scaffolding template for NestJS controller/service/DTO/module |
| 3 | `add-frontend-form` | RHF + Zod + TanStack mutation complete template |
| 4 | `signal-lab-orchestrator` | 7-phase PRD executor with context.json state and resume support |

### Commands

| # | Command | What it does |
|---|---------|-------------|
| 1 | `/add-endpoint` | Scaffold new NestJS endpoint with observability in one prompt |
| 2 | `/check-obs` | Audit all services for missing metrics/logs/Sentry |
| 3 | `/run-prd <path>` | Execute PRD via orchestrator pipeline |

### Hooks

| # | Hook | Problem it solves |
|---|------|-----------------|
| 1 | `schema-change-reminder` (PostEdit: schema.prisma) | Blocks "forgot to migrate" mistake — most common Prisma pitfall |
| 2 | `new-endpoint-obs-check` (PostEdit: *.controller.ts) | Reminds to run /check-obs after touching a controller |
| 3 | `no-hardcoded-secrets` (PreCommit) | Catches hardcoded SENTRY_DSN before it hits the repo |
| 4 | `no-console-log` (PreCommit) | Enforces pino logger over console.log in backend |

### Rules

| # | Rule file | What it fixes |
|---|----------|--------------|
| 1 | `01-stack-constraints.mdc` | Prevents adding Redux, SWR, TypeORM, raw SQL |
| 2 | `02-observability-conventions.mdc` | Enforces metric naming, log format, Sentry usage |
| 3 | `03-prisma-patterns.mdc` | Enforces PrismaService DI, migration workflow |
| 4 | `04-frontend-patterns.mdc` | TanStack Query for server state, no useState for remote data |
| 5 | `05-error-handling.mdc` | NestJS exceptions, Sentry capture, no silent catches |

### Marketplace Skills

| # | Skill | Why connected |
|---|-------|--------------|
| 1 | `nestjs-best-practices` | NestJS DI, decorators, module architecture |
| 2 | `prisma-orm` | Schema syntax, migrations, query API |
| 3 | `next-best-practices` | App Router, Server/Client component split |
| 4 | `shadcn-ui` | Component API, variant system, theming |
| 5 | `tailwind-v4-shadcn` | Tailwind utilities, CSS custom properties |
| 6 | `docker-expert` | Compose patterns, health checks, volumes |
| 7 | `postgresql-table-design` | Index strategy for ScenarioRun queries |

**What custom skills add that marketplace doesn't have:**
- Signal Lab-specific `metrics.registry.ts` + pino logger wiring pattern
- Orchestrator with 7-phase pipeline and context.json state persistence
- Project-specific observability checklist tied to the actual codebase

---

## Orchestrator

- **Path to skill**: `.cursor/skills/signal-lab-orchestrator/SKILL.md`
- **Context file location**: `.execution/<timestamp>/context.json`
- **Phases**: 7 (analysis → codebase-scan → planning → decomposition → implementation → review → report)
- **Fast model tasks**: schema fields, DTOs, simple endpoints, metric additions, UI components (~80%)
- **Default model tasks**: architecture planning, complex integrations, cross-cutting review (~20%)
- **Supports resume**: yes — reads `currentPhase` from context.json on restart

---

## What I'd Add with +4 Hours

1. **Tests** — Jest integration tests for scenario service with real DB (testcontainers)
2. **Auth** — Bearer token for the API, logged in audit trail
3. **Alerting** — Grafana alert rule firing when error rate > 10% for 5min
4. **Seed** — `prisma db seed` with 20 sample runs for immediate Grafana gratification
5. **E2E** — Playwright test: run scenario → verify badge appears in history

---

## Questions for Defence (Prepared Answers)

**1. Why this decomposition of skills?**
Each skill maps to one recurring workflow: adding observability (daily), scaffolding endpoints (weekly), building forms (weekly), executing PRDs (per sprint). They're sized to be self-contained — the observability skill has a checklist so no step is forgotten.

**2. Which tasks go to fast model?**
Mechanical tasks with a clear spec: add a field, create a DTO, add a metric line, create a CRUD endpoint. The spec is in the prompt — the model just fills in the blanks. Fast = low creativity required, high structure provided.

**3. Marketplace vs custom skills?**
Marketplace covers framework syntax (NestJS DI, Prisma queries). Custom covers Signal Lab specifics: how metrics are registered, which pino fields are required, how the orchestrator state machine works. No duplication.

**4. Which hooks reduce real errors?**
The `schema-change-reminder` hook catches the #1 Prisma developer mistake. The `no-hardcoded-secrets` PreCommit hook stops secret leaks at the source.

**5. How does orchestrator save context?**
Main chat: reads context.json (~2k tokens), writes subagent prompt (~1k tokens), reads result (~1k tokens). Total per task: ~4k tokens. A 12-task PRD costs ~48k tokens in the main chat vs ~500k+ if done in one prompt.
