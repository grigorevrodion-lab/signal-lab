# /check-obs

Audit all NestJS services for observability completeness. Reports gaps.

## What This Command Does

For every file in `apps/backend/src/**/*.service.ts`:

1. **Metrics check**
   - Does the service import from `metrics.registry`?
   - Is there a Counter increment on every code path?
   - Is there a Histogram timer measuring operation duration?

2. **Logging check**
   - Is `logger` from `../logger` imported?
   - Does every public method have at least 1 log call?
   - Are error paths logged with `logger.error({ err })`?

3. **Sentry check**
   - Is `@sentry/node` imported?
   - Does the error path call `Sentry.captureException()`?

## Output Format

```
Observability Audit — Signal Lab Backend
────────────────────────────────────────

scenario.service.ts          ✓ metrics  ✓ logging  ✓ sentry
[new-service].service.ts     ✗ metrics  ✓ logging  ✗ sentry

Issues found: 2
  [new-service].service.ts:
    - Missing metrics: add Counter/Histogram for each operation
    - Missing Sentry: add captureException in error path
    
To fix: apply @add-observability skill to flagged services.
```

## Follow-up
If issues found, run:
```
@add-observability
Target: apps/backend/src/<name>/<name>.service.ts
```
