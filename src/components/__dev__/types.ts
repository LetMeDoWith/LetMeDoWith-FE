export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface ConsoleEntry {
  id: number;
  level: LogLevel;
  timestamp: number;
  args: string[];
}

export type NetworkStatus = 'pending' | 'fulfilled' | 'rejected';

export interface NetworkEntry {
  id: number;
  method: string;
  url: string;
  status: NetworkStatus;
  statusCode?: number;
  startTime: number;
  duration?: number;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
}

export type DevToolsTab = 'Elements' | 'Console' | 'Network' | 'Storage' | 'Query';
