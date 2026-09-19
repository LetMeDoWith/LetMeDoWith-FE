import type { AnalyticsCategory } from 'utils/analytics';

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

export type DevToolsTab = 'Elements' | 'Console' | 'Network' | 'Storage' | 'Query' | 'Analytics';

export interface AnalyticsEntry {
  id: number;
  timestamp: number;
  name: string;
  params?: Record<string, unknown>;
  category: AnalyticsCategory;
  /* __DEV__에서는 전송되지 않으므로 기록만인지 실제 전송인지 구분한다 */
  sent: boolean;
}
