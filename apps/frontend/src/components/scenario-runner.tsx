'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2, Play } from 'lucide-react';
import { api } from '@/lib/api';
import type { ScenarioType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  type: z.enum(['success', 'validation_error', 'system_error', 'slow_request', 'teapot']),
  name: z.string().max(255).optional(),
});

type FormValues = z.infer<typeof schema>;

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  success: 'Success',
  validation_error: 'Validation Error',
  system_error: 'System Error (500)',
  slow_request: 'Slow Request (2–5s)',
  teapot: "I'm a Teapot (418)",
};

export function ScenarioRunner() {
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'success', name: '' },
  });

  const selectedType = watch('type');

  const { mutate, isPending } = useMutation({
    mutationFn: api.runScenario,
    onSuccess: (data) => {
      if ('signal' in data && data.signal === 42) {
        toast.success(`Teapot! Signal: ${data.signal} — ${data.message}`, { duration: 5000 });
      } else {
        toast.success(`Run completed in ${data.duration}ms`, { description: `ID: ${data.id}` });
      }
      void queryClient.invalidateQueries({ queryKey: ['runs'] });
    },
    onError: (err: Error) => {
      toast.error('Run failed', { description: err.message });
      void queryClient.invalidateQueries({ queryKey: ['runs'] });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate({ type: values.type, name: values.name || undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Run Scenario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scenario type</label>
            <Select
              value={selectedType}
              onValueChange={(v) => setValue('type', v as ScenarioType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SCENARIO_LABELS) as ScenarioType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {SCENARIO_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name (optional)</label>
            <Input
              placeholder="e.g. my-test-run"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Scenario
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
