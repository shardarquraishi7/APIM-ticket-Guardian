import baseLogger from '@telus/core-logger';

export function createLogger(module: string) {
  return baseLogger.child({
    module,
  });
}
