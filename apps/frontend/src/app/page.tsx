import { ScenarioRunner } from '@/components/scenario-runner';
import { RunHistory } from '@/components/run-history';
import { ObsLinks } from '@/components/obs-links';
import { Activity } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Signal Lab</h1>
          <span className="text-sm text-muted-foreground">
            — observability playground
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <ScenarioRunner />
            <ObsLinks />
          </div>
          <div className="md:col-span-2">
            <RunHistory />
          </div>
        </div>
      </div>
    </main>
  );
}
