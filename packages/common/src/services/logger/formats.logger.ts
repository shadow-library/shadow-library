/**
 * Importing npm packages
 */
import { cyan, gray, yellow } from '@colors/colors/safe';
import { format } from 'winston';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
let timestamp: number;

function padLevel(level: string) {
  const padding = '   '.substring(0, 5 - (level?.length ?? 0));
  return level + padding;
}

/** Formats and print the logs to the console */
export const consoleFormat = format.printf(info => {
  const level = info.level;
  const prevTime = timestamp;
  timestamp = Date.now();
  const timeTaken = prevTime ? gray(` +${timestamp - prevTime}ms`) : '';
  const stack = info.stack ? '\n' + (Array.isArray(info.stack) ? info.stack.join('\n') : info.stack) : '';

  if (level != 'http') return `${padLevel(info.level)} ${yellow(`[${info.label || '-'}]`)} ${info.message} ${timeTaken} ${stack}`;
  return cyan(`${padLevel('HTTP')} [REST] ${info.method} ${info.url} - ${info.timeTaken}ms`);
});

/** Appends the additional data to the log metadata */
export function additionalDataFormat(fn: () => Record<string, any>): ReturnType<typeof format> {
  return format(info => {
    const data = fn();
    for (const key in data) info[key] = data[key];
    return info;
  });
}
