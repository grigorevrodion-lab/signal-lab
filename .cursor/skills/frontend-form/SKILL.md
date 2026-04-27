---
name: add-frontend-form
description: Add a shadcn/ui form with React Hook Form, Zod validation, and TanStack Query mutation
---

# Frontend Form Skill

## When to Use
- Adding a new form to the Next.js frontend
- Connecting UI to a new backend endpoint
- Any user input that triggers a POST/PUT/PATCH request

## Complete Template

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 1. Define schema with Zod
const schema = z.object({
  name: z.string().min(1, 'Required').max(255),
  type: z.enum(['a', 'b', 'c']),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const queryClient = useQueryClient();
  
  // 2. Init form with zodResolver
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // 3. Mutation wired to API
  const { mutate, isPending } = useMutation({
    mutationFn: api.createSomething,
    onSuccess: () => {
      toast.success('Created successfully');
      reset();
      // 4. Invalidate the list query so history refreshes
      void queryClient.invalidateQueries({ queryKey: ['something'] });
    },
    onError: (err: Error) => {
      toast.error('Failed', { description: err.message });
    },
  });

  const onSubmit = (values: FormValues) => mutate(values);

  return (
    <Card>
      <CardHeader><CardTitle>Create Something</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input {...register('name')} placeholder="Enter name" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Checklist
- [ ] Zod schema defined before the component
- [ ] `zodResolver` used in `useForm`
- [ ] Submit button has `disabled={isPending}` and spinner icon
- [ ] `onSuccess` calls `queryClient.invalidateQueries` for related list
- [ ] `onError` shows `toast.error` with the error message
- [ ] Field errors displayed below inputs using `errors.<field>.message`
- [ ] `reset()` called after successful submit to clear the form

## Adding to api.ts
```typescript
// In src/lib/api.ts — add the new API method:
createSomething: (payload: CreateSomethingPayload): Promise<Something> =>
  request('/api/somethings', { method: 'POST', body: JSON.stringify(payload) }),
```
