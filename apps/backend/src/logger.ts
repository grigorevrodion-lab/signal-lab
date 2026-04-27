import pino from 'pino';

function buildLogger(): pino.Logger {
  const base: pino.LoggerOptions = {
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  const lokiUrl = process.env.LOKI_URL;
  if (!lokiUrl) {
    return pino(base);
  }

  const transport = pino.transport({
    targets: [
      {
        target: 'pino/file',
        options: { destination: 1 },
        level: base.level as string,
      },
      {
        target: 'pino-loki',
        options: {
          host: lokiUrl,
          labels: { app: 'signal-lab' },
          batching: true,
          interval: 3,
        },
        level: base.level as string,
      },
    ],
  });

  return pino(base, transport);
}

export const logger = buildLogger();
