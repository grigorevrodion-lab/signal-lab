import { Counter, Histogram, Registry } from 'prom-client';

export const registry = new Registry();

export const scenarioRunsTotal = new Counter({
  name: 'scenario_runs_total',
  help: 'Total number of scenario runs',
  labelNames: ['type', 'status'] as const,
  registers: [registry],
});

export const scenarioRunDurationSeconds = new Histogram({
  name: 'scenario_run_duration_seconds',
  help: 'Duration of scenario runs in seconds',
  labelNames: ['type'] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [registry],
});

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'] as const,
  registers: [registry],
});
