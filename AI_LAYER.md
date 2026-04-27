# Signal Lab — Cursor AI Layer

The AI layer turns this repository into an environment where a fresh Cursor chat can continue development without manual onboarding. Every convention, pattern, and workflow is encoded as a reusable artifact.

---

## Rules (`.cursor/rules/`)

| File | Scope | What it enforces |
|------|-------|-----------------|
| `01-stack-constraints.mdc` | `**/*.ts, **/*.tsx` | Forbidden/allowed libraries. No Redux, no SWR, no TypeORM, no raw SQL. Always applied. |
| `02-observability-conventions.mdc` | `apps/backend/src/**` | Metric naming (snake_case, unit suffixes), pino log format (required fields), Sentry usage rules. |
| `03-prisma-patterns.mdc` | `apps/backend/src/**, prisma/**` | Inject PrismaService via DI, no raw SQL, migration workflow, schema conventions (cuid IDs). |
| `04-frontend-patterns.mdc` | `apps/frontend/src/**` | TanStack Query for server state, RHF + Zod for forms, shadcn/ui for components, no `useState` for remote data. |
| `05-error-handling.mdc` | `**/*.ts, **/*.tsx` | NestJS HTTP exceptions, Sentry capture before rethrow, `logger.error({ err })`, no silent catches. |

Rules don't conflict because they're scoped to different directories and concern orthogonal topics.

---

## Custom Skills (`.cursor/skills/`)

### `add-observability`
**When**: Adding any new backend endpoint or service method.
**What**: Step-by-step guide to add prom-client metric counter + histogram, pino structured log with required fields, Sentry breadcrumb + captureException. Includes checklist to prevent forgetting any signal.

### `add-nestjs-endpoint`
**When**: Creating a new domain resource (controller + service + DTO + module).
**What**: Complete scaffolding templates with placeholder substitution. Wires observability automatically. Shows how to add to AppModule.

### `add-frontend-form`
**When**: Adding a new form to the Next.js UI.
**What**: Complete RHF + Zod + TanStack mutation template. Includes all patterns: zodResolver, isPending on button, onSuccess invalidation, onError toast.

### `signal-lab-orchestrator`
**When**: Implementing a full PRD end-to-end via `/run-prd`.
**What**: 7-phase pipeline (analysis → codebase-scan → planning → decomposition → implementation → review → report). Delegates 80% to fast models. Persists state in `.execution/<timestamp>/context.json`. Resume-safe after interruption.

---

## Commands (`.cursor/commands/`)

| Command | What it does |
|---------|-------------|
| `/add-endpoint` | Scaffolds a complete NestJS endpoint with observability in one shot |
| `/check-obs` | Audits all services for missing metrics, logs, Sentry — outputs gap report |
| `/run-prd <path>` | Runs the orchestrator on a PRD file, 7 phases, resume-safe |

---

## Hooks (`.cursor/settings.json`)

| Hook | Trigger | Problem it solves |
|------|---------|-------------------|
| `schema-change-reminder` | PostEdit on `prisma/schema.prisma` | Prevents the classic "schema changed but forgot to migrate" error — the single most common developer mistake with Prisma |
| `new-endpoint-obs-check` | PostEdit on `**/*.controller.ts` | Reminds to verify observability is wired whenever a controller is touched — runs `/check-obs` suggestion |
| `no-hardcoded-secrets` | PreCommit | Blocks commits with literal SENTRY_DSN values in source files |
| `no-console-log` | PreCommit | Blocks backend `console.log` commits (use pino) |

---

## Marketplace Skills

| Skill | Why connected |
|-------|--------------|
| `nestjs-best-practices` | Provides NestJS module/DI/decorator patterns. Custom skills reference but don't duplicate it — they add observability on top. |
| `prisma-orm` | Covers Prisma schema syntax, migrations, relation patterns. Custom rule 03 adds Signal Lab-specific constraints (cuid, Json metadata). |
| `next-best-practices` | App Router patterns, Server/Client component split, metadata API. |
| `shadcn-ui` | Component API, variant patterns, theming. Prevents re-inventing UI components. |
| `tailwind-v4-shadcn` | TW utility patterns, dark mode, custom CSS variables as used in `globals.css`. |
| `docker-expert` | Docker Compose, multi-stage Dockerfiles, health checks, volume mounts. |
| `postgresql-table-design` | Index strategy, data type choices, normalization — consulted when extending Prisma schema. |

**What custom skills add that marketplace doesn't cover:**
- Observability wiring specific to Signal Lab's `metrics.registry.ts` + pino logger pattern
- Signal Lab orchestrator for multi-PRD execution with context.json state
- Project-specific conventions (scenario types, Loki labels, Sentry tags)
