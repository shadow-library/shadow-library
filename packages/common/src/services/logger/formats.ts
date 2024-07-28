/* istanbul ignore file */
/**
 * Importing npm packages
 */
import { cyan, gray, yellow } from '@colors/colors/safe';
import { Logform, format } from 'winston';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type Format = Logform.Format;

export interface BriefFormatOptions {
  label?: boolean;
  timestamp?: boolean;
  stack?: boolean;
}

declare module 'winston' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace format {
    function brief(opts?: BriefFormatOptions): Format;
  }
}

/**
 * Declaring the constants
 */
let timestamp: number;

function padLevel(level: string) {
  level = level.toUpperCase();
  const padding = '   '.substring(0, 5 - (level?.length ?? 0));
  return level + padding;
}

format.brief = function (opts: BriefFormatOptions = {}) {
  const printLabel = opts.label ?? true;
  const printTimestamp = opts.timestamp ?? true;
  const printStack = opts.stack ?? true;

  return format.printf(info => {
    const level = info.level;
    const prevTime = timestamp;
    timestamp = Date.now();
    const timeTaken = prevTime ? gray(` +${timestamp - prevTime}ms`) : '';
    const stack = info.stack ? '\n' + (Array.isArray(info.stack) ? info.stack.join('\n') : info.stack) : '';

    if (level === 'http') return cyan(`${padLevel('HTTP')} [REST] ${info.method} ${info.url} - ${info.timeTaken}ms`);

    const message = [padLevel(level)];
    if (printLabel) message.push(yellow(`[${info.label || '-'}]`));
    message.push(info.message);
    if (printTimestamp) message.push(timeTaken);
    if (printStack) message.push(stack);
    return message.join(' ');
  });
};

export { format };
