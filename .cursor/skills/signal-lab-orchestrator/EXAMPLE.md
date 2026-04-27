# Orchestrator Example Run

## Input
```
@signal-lab-orchestrator

PRD path: prds/002_prd-observability-demo.md
Resume from: start
```

## What Happens

**Phase 1 — PRD Analysis** (fast model, ~30s)
> Orchestrator sends subagent to read PRD 002.
> Subagent extracts 9 features: F1-F9.
> Result saved to context.json `phases.analysis`.

**Phase 2 — Codebase Scan** (fast, explore, ~20s)
> Subagent lists current files.
> Finds: ScenarioRun in Prisma ✓, ScenarioController ✓, metrics.registry ✓
> Missing: Grafana dashboard JSON, slow_request handler, pino-loki transport
> Result saved to context.json `phases.codebase`.

**Phase 3 — Planning** (default, ~1min)
> Orchestrator creates high-level plan addressing only missing pieces.
> 4 implementation groups: database, backend, frontend, infra.

**Phase 4 — Decomposition** (default, ~1min)
> 12 atomic tasks created, each 5-10 min scope.
> 9 marked `fast`, 3 marked `default`.
> Tasks with dependencies mapped.

**Phase 5 — Implementation** (fast 80% / default 20%, ~20min)
```
[fast]    task-001 ✓  Add pino-loki transport
[fast]    task-002 ✓  Add slow_request delay handler
[fast]    task-003 ✓  Add teapot scenario (easter egg)
[default] task-004 ✓  Wire metrics middleware for all routes
[fast]    task-005 ✓  Create Grafana dashboard JSON
...
```

**Phase 6 — Review** (fast, readonly, ~2min)
```
F1 (UI Form): PASS
F2 (Run History): PASS
F3 (Obs Links): PASS
F4 (Scenario Execution): PASS — all 4 types + teapot
F5 (Prometheus metrics): PASS
F6 (Structured Logging): PASS
F7 (Sentry): PASS
F8 (Grafana Dashboard): PASS — 5 panels including Loki
F9 (Docker Compose): PASS
```

**Phase 7 — Report**
```
Signal Lab PRD 002 — Complete

Tasks: 12 completed, 0 failed, 1 retry
Duration: ~25 min
Model usage: 9 fast, 3 default  ← 75% fast model

Next steps:
  - Set SENTRY_DSN in .env
  - docker compose up -d
  - Run verification walkthrough (README.md)
```
