# /add-endpoint

Scaffold a new NestJS endpoint with full observability wiring.

## Usage
```
/add-endpoint
Resource: <name>
Operations: <create|read|update|delete, comma-separated>
```

## What This Command Does

1. **Read** `apps/backend/src/app.module.ts` to understand current imports
2. **Create** the following files using the `add-nestjs-endpoint` skill:
   - `apps/backend/src/<name>/dto/create-<name>.dto.ts`
   - `apps/backend/src/<name>/<name>.service.ts`
   - `apps/backend/src/<name>/<name>.controller.ts`
   - `apps/backend/src/<name>/<name>.module.ts`
3. **Add** Prisma model to `apps/backend/prisma/schema.prisma`
4. **Wire** the module into `app.module.ts` imports
5. **Add observability** following `add-observability` skill:
   - Register counter + histogram in `metrics.registry.ts`
   - Add pino log calls in service methods
   - Add Sentry capture in error paths
6. **Remind**: run `npx prisma migrate dev --name add-<name>` after schema change

## Output
Report: files created, Prisma model added, metrics registered, module wired.
Then verify at `http://localhost:3001/api/docs`.
