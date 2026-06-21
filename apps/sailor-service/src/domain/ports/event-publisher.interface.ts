export interface IEventPublisher {
  publish(event: string, payload: Record<string, any>): Promise<void>;
}
