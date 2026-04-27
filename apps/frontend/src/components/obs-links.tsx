import type { ComponentType } from 'react';
import { ExternalLink, BarChart3, FileText, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ObsLink {
  label: string;
  url: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

const LINKS: ObsLink[] = [
  {
    label: 'Grafana Dashboard',
    url: 'http://localhost:3100',
    description: 'Scenario runs, latency, error rate',
    icon: BarChart3,
  },
  {
    label: 'Prometheus Metrics',
    url: 'http://localhost:3001/metrics',
    description: 'Raw Prometheus metrics endpoint',
    icon: Activity,
  },
  {
    label: 'Loki Logs (via Grafana)',
    url: 'http://localhost:3100/explore?orgId=1&left=%7B%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22%7Bapp%3D%5C%22signal-lab%5C%22%7D%22%7D%5D%7D',
    description: '{app="signal-lab"} — filter by scenarioType',
    icon: FileText,
  },
  {
    label: 'Sentry',
    url: 'https://sentry.io',
    description: 'Exception captures from system_error runs',
    icon: AlertTriangle,
  },
  {
    label: 'API Docs (Swagger)',
    url: 'http://localhost:3001/api/docs',
    description: 'Interactive API documentation',
    icon: ExternalLink,
  },
];

export function ObsLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Observability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {LINKS.map(({ label, url, description, icon: Icon }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-md border p-3 text-sm hover:bg-accent transition-colors group"
            >
              <Icon className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground shrink-0" />
              <div className="min-w-0">
                <div className="font-medium flex items-center gap-1">
                  {label}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">{description}</div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
