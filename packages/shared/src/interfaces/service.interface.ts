export interface ServiceInterface {
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
}

export interface ServiceOptions {
  name: string;
  version: string;
  port?: number;
  host?: string;
}
