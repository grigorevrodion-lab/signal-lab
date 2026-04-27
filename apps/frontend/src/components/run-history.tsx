'use client';

import { useQuery } from '@tanstack/react-query';
import { History, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import type { ScenarioRun, ScenarioStatus } from '@/lib/types';
import { formatDate, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STATUS_VARIANT: Record<ScenarioStatus, 'success' | 'destructive' | 'warning' | 'teapot'> = {
  completed: 'success',
  failed: 'destructive',
  validation_error: 'warning',
  teapot: 'teapot',
};

const STATUS_LABEL: Record<ScenarioStatus, string> = {
  completed: 'OK',
  failed: 'Error',
  validation_error: 'Invalid',
  teapot: '418',
};

function RunRow({ run }: { run: ScenarioRun }) {
  const variant = STATUS_VARIANT[run.status] ?? 'outline';
  return (
    <div className="flex items-center justify-between rounded-md border p-3 text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Badge variant={variant}>{STATUS_LABEL[run.status]}</Badge>
        <span className="font-mono text-xs text-muted-foreground truncate">{run.type}</span>
        {run.name && <span className="truncate text-muted-foreground">· {run.name}</span>}
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
        <span className="text-muted-foreground">{formatDuration(run.duration)}</span>
        <span className="text-muted-foreground text-xs">{formatDate(run.createdAt)}</span>
      </div>
    </div>
  );
}

export function RunHistory() {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['runs'],
    queryFn: api.getRecentRuns,
    refetchInterval: 5000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Run History
          </span>
          {isFetching && (
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : !data?.length ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No runs yet. Run a scenario to see results here.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {data.map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
