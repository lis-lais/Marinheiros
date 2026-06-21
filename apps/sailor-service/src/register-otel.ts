import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function startOtelSdk(serviceName: string) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .catch(() => {})
      .finally(() => process.exit(0));
  });
}

startOtelSdk('Marinheiros/sailor-service');
