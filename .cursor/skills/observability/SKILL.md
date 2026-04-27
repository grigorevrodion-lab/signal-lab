---
name: add-observability
description: Add Prometheus metrics, Loki structured logging, and Sentry error tracking to any NestJS endpoint
---

# Observability Skill

## When to Use
- Adding a new NestJS service method or controller endpoint
- Reviewing an existing endpoint that's missing metrics/logs
- After running `/check-obs` and finding gaps

## What This Skill Does
Adds production-grade observability to a NestJS endpoint in 3 steps.

---

## Step 1: Metrics

Add metrics to `src/metrics/metrics.registry.ts`:

```typescript
// Counter — for counts (requests, errors, events)
export const myOperationTotal = new Counter({
  name: 'my_operation_total',
  help: 'Total number of my operations',
  labelNames: ['status'] as const,   // always 'status', add domain labels
  registers: [registry],
});

// Histogram — for durations
export const myOperationDurationSeconds = new Histogram({
  name: 'my_operation_duration_seconds',
  help: 'Duration of my operations',
  labelNames: ['type'] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry],
});
```

In your service:
```typescript
const timer = myOperationDurationSeconds.startTimer({ type: operationType });
// ... do work ...
const durationSec = timer();               // stop timer, returns seconds
myOperationTotal.inc({ status: 'completed' });
```

---

## Step 2: Structured Logging

Import and use the shared pino logger:
```typescript
import { logger } from '../logger';

// At operation start (optional, debug level):
logger.debug({ operationType, msg: 'Starting operation' });

// On success:
logger.info({
  msg: 'Operation completed',
  operationType,
  operationId: result.id,
  duration: durationMs,
});

// On expected failure (validation, business rule):
logger.warn({
  msg: 'Operation rejected',
  operationType,
  reason: 'validation_failed',
  duration: durationMs,
});

// On unexpected error:
logger.error({
  msg: 'Operation failed unexpectedly',
  operationType,
  err: error,           // pino serializes Error objects
  duration: durationMs,
});
```

---

## Step 3: Sentry

```typescript
import * as Sentry from '@sentry/node';

// For non-critical events (adds context breadcrumb):
Sentry.addBreadcrumb({
  category: 'my-domain',
  message: 'Event description',
  level: 'warning',
  data: { operationType, userId },
});

// For captured exceptions (unhandled errors):
Sentry.captureException(error, {
  tags: { operationType },
  extra: { duration: durationMs, payload: dto },
});
```

---

## Checklist
- [ ] Counter incremented on every execution path (success AND failure)
- [ ] Histogram `startTimer()` called before the operation, stopped after
- [ ] `logger.info` on success with `msg`, entity id, duration
- [ ] `logger.error` on failure with `err` field
- [ ] `Sentry.captureException` on unhandled errors
- [ ] Labels are lowercase snake_case
- [ ] Metrics registered in `metrics.registry.ts`, not inline
