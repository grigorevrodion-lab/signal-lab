export type ScenarioType =
  | 'success'
  | 'validation_error'
  | 'system_error'
  | 'slow_request'
  | 'teapot';

export type ScenarioStatus =
  | 'completed'
  | 'failed'
  | 'validation_error'
  | 'teapot';

export interface ScenarioRun {
  id: string;
  type: ScenarioType;
  name: string | null;
  status: ScenarioStatus;
  duration: number;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface RunScenarioPayload {
  type: ScenarioType;
  name?: string;
}

export interface RunScenarioResponse extends ScenarioRun {
  signal?: number;
  message?: string;
}
