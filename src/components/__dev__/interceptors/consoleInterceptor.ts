import type { LogLevel } from 'components/__dev__/types';
import { useDevToolsStore, getNextConsoleId } from 'components/__dev__/devToolsStore';

type ConsoleFn = (...args: unknown[]) => void;

const originals: Record<LogLevel, ConsoleFn> = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

function stringify(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function createInterceptedFn(level: LogLevel): ConsoleFn {
  return (...args: unknown[]) => {
    // 원본 콘솔 함수 호출
    originals[level](...args);

    // DevTools 스토어에 추가
    useDevToolsStore.getState().pushConsoleLog({
      id: getNextConsoleId(),
      level,
      timestamp: Date.now(),
      args: args.map(stringify),
    });
  };
}

const installConsoleInterceptor = () => {
  const levels: LogLevel[] = ['log', 'info', 'warn', 'error'];
  for (const level of levels) {
    (console as unknown as Record<string, ConsoleFn>)[level] = createInterceptedFn(level);
  }
};

const uninstallConsoleInterceptor = () => {
  const levels: LogLevel[] = ['log', 'info', 'warn', 'error'];
  for (const level of levels) {
    (console as unknown as Record<string, ConsoleFn>)[level] = originals[level];
  }
};

export { installConsoleInterceptor, uninstallConsoleInterceptor };
