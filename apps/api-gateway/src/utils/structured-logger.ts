import { trace, context } from '@opentelemetry/api';

export class StructuredLogger {
  constructor(private readonly serviceName: string) {}

  private log(level: string, message: string, meta?: Record<string, any>) {
    const activeSpan = trace.getSpan(context.active());
    const spanContext = activeSpan?.spanContext();

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      traceId: spanContext?.traceId || '',
      spanId: spanContext?.spanId || '',
      ...meta,
    };

    process.stdout.write(JSON.stringify(logEntry) + '\n');
  }

  info(message: string, meta?: Record<string, any>) {
    this.log('INFO', message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    this.log('ERROR', message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log('WARN', message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    this.log('DEBUG', message, meta);
  }
}

export const logger = new StructuredLogger('Marinheiros/api-gateway');
