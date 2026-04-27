---
name: signal-lab-orchestrator
description: Multi-phase PRD executor for Signal Lab. Decomposes a PRD into atomic tasks, delegates to subagents by model tier, persists state in context.json for resume, produces a final report.
---

# Signal Lab Orchestrator

## When to Use
- Implementing a new PRD end-to-end: `/run-prd prds/002_prd-observability-demo.md`
- Resuming an interrupted execution: the orchestrator reads `.execution/<id>/context.json` and continues
- Reviewing progress on a partially completed PRD

## Philosophy (Context Economy)
The orchestrator keeps the main chat context minimal (~15k tokens).
Heavy work (implementation, file edits) happens in subagents.
The orchestrator only:
1. Reads context.json
2. Selects the next batch of tasks
3. Writes a concise subagent prompt
4. Updates context.json with results
5. Moves to the next phase

---

## Usage

```
@signal-lab-orchestrator

PRD path: prds/002_prd-observability-demo.md
Resume from: [phase name or "start"]
```

---

## Phases

| # | Phase | Model | Responsibility |
|---|-------|-------|----------------|
| 1 | prd-analysis | fast | Extract features, constraints, acceptance criteria |
| 2 | codebase-scan | fast (explore) | Map current file structure, find relevant modules |
| 3 | planning | default | High-level implementation plan with risks |
| 4 | decomposition | default | Break plan into atomic tasks with dependencies |
| 5 | implementation | fast (80%) / default (20%) | Execute tasks in dependency order |
| 6 | review | fast (readonly) | Verify implementation matches PRD criteria |
| 7 | report | fast | Generate final execution report |

---

## Execution Protocol

### Phase 1: PRD Analysis (fast model)

**Prompt template for subagent:**
```
Read the PRD at [path]. Extract and output a JSON object:
{
  "title": "...",
  "features": [{ "id": "F1", "name": "...", "acceptance": ["..."] }],
  "constraints": ["stack constraint 1", "..."],
  "outOfScope": ["..."]
}
Keep it concise. No implementation yet.
```

### Phase 2: Codebase Scan (fast, explore mode)

**Prompt template:**
```
Explore the project structure at the repo root.
List existing files in apps/backend/src/ and apps/frontend/src/.
Identify which features from this list already exist vs need to be created: [feature list].
Output: { "existing": [...], "missing": [...] }
```

### Phase 3: Planning (default model)

**Prompt template:**
```
Given PRD features [list] and existing code [codebase scan result]:
Create an implementation plan. For each feature:
- What to create/modify
- Which files are affected
- Dependencies on other features
Output a structured plan, not code.
```

### Phase 4: Decomposition (default model)

**Break each feature into tasks. Each task:**
- Completable in 5–10 minutes
- Has a single file or module as target
- Marked with model tier (see below)
- Has explicit dependencies on other task IDs

**Output format:**
```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Add ScenarioRun model to Prisma schema",
      "target": "apps/backend/prisma/schema.prisma",
      "type": "database",
      "complexity": "low",
      "model": "fast",
      "dependsOn": [],
      "skill": "prisma-orm",
      "prompt": "Add ScenarioRun model with fields: id (cuid), type, name?, status, duration, errorMessage?, metadata Json?, createdAt. Add indexes on type, status, createdAt."
    }
  ]
}
```

### Phase 5: Implementation

**Model selection rules:**
```
fast model (haiku or equivalent) → 80%+ of tasks:
  - Add/modify Prisma schema fields
  - Create DTO with validation decorators
  - Create simple CRUD endpoint
  - Add a metric counter or histogram
  - Add a structured log line
  - Create a React component with no complex logic
  - Write a unit test for a pure function

default model → 20% of tasks:
  - Architecture decisions with trade-offs
  - Complex service logic (multi-step async, transactions)
  - Integration of multiple systems (Sentry + metrics + logging in one service)
  - Cross-cutting changes affecting 3+ files
  - Code review with trade-off analysis
```

**Subagent prompt template:**
```
Task: [task.title]
Target file: [task.target]
Model: [task.model]

Context (read these files first):
- [relevant existing files]

Instructions:
[task.prompt]

Rules to follow:
- Stack constraints: see .cursor/rules/01-stack-constraints.mdc
- [relevant rule]

When done, confirm: "Task [id] completed: [one-line summary of what changed]"
```

### Phase 6: Review

For each domain (database, backend, frontend):
```
Read the files listed in [domain tasks].
Verify each acceptance criterion from the PRD:
- [criterion 1]: PASS/FAIL + reason
- [criterion 2]: PASS/FAIL + reason

If FAIL: list specific issues to fix.
```

Review loop (max 3 attempts per task group):
1. Run reviewer subagent (readonly)
2. If not all PASS → create fix task → run implementer
3. After 3 failures → mark `{ "status": "failed", "reason": "..." }` and continue

### Phase 7: Report

```
Signal Lab PRD Execution — [status]

Execution ID: [executionId]
Duration: [elapsed]

Tasks: [N completed], [N failed], [N retries]
Model usage: [N fast], [N default]

Completed:
  ✓ [task title]
  ...

Failed:
  ✗ [task title] — [reason]

Next steps:
  - [manual action needed]
  - Run verification walkthrough: see README.md
```

---

## Context File (`context.json`)

Created at `.execution/<timestamp>/context.json`. Orchestrator reads this at every step.

```json
{
  "executionId": "2026-04-08-14-30",
  "prdPath": "prds/002_prd-observability-demo.md",
  "status": "in_progress",
  "currentPhase": "implementation",
  "signal": 42,
  "phases": {
    "analysis":      { "status": "completed", "result": { ... } },
    "codebase":      { "status": "completed", "result": { ... } },
    "planning":      { "status": "completed", "result": "..." },
    "decomposition": { "status": "completed", "result": { "tasks": [...] } },
    "implementation":{ "status": "in_progress", "completedTasks": 5, "totalTasks": 12 },
    "review":        { "status": "pending" },
    "report":        { "status": "pending" }
  },
  "tasks": [ ... ]
}
```

---

## Resume Protocol

```
1. Read .execution/*/context.json (latest by timestamp)
2. Find currentPhase
3. Within implementation: find first task with status != "completed"
4. Continue from there — skip all completed phases and tasks
5. If all tasks done but review/report pending — proceed to those phases
```

---

## Skills Used by This Orchestrator

| Phase | Skill Called |
|-------|-------------|
| Schema changes | `prisma-orm` (marketplace) |
| Backend endpoints | `add-nestjs-endpoint` (custom) |
| Observability | `add-observability` (custom) |
| Frontend forms | `add-frontend-form` (custom) |
| Docker changes | `docker-expert` (marketplace) |
| Review | `nestjs-best-practices` + `next-best-practices` (marketplace) |
