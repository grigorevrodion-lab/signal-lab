import type { RunScenarioPayload, RunScenarioResponse, ScenarioRun } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const data: unknown = await res.json().catch(() => null);

  // 418 is a special "success" (teapot easter egg) — return body, don't throw
  if (!res.ok && res.status !== 418) {
    const message =
      (data as { message?: string })?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  runScenario: (payload: RunScenarioPayload): Promise<RunScenarioResponse> =>
    request('/api/scenarios/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getRecentRuns: (): Promise<ScenarioRun[]> =>
    request('/api/scenarios'),
};
