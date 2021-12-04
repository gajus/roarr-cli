import {
  parse,
  test,
} from 'liqe';
import split from 'split2';
import type {
  LogFilterConfigurationType,
} from '../types';
import {
  formatInvalidInputMessage,
  isRoarrLine,
} from '../utilities';

export const createLogFilter = (configuration: LogFilterConfigurationType) => {
  let lastLinePrinterLinesAgo = 0;
  let printNextLines = 0;
  let buffer: string[] = [];

  const query = configuration.filterExpression ? parse(configuration.filterExpression) : null;

  const filterLog = (line: string) => {
    buffer.push(line);

    buffer = buffer.slice(-1 * configuration.lag - 1);

    const subject = JSON.parse(line);

    let result;

    if (
      query && test(query, subject) ||
      configuration.filterFunction?.(subject)
    ) {
      result = buffer.slice(-1 * lastLinePrinterLinesAgo - 1, -1).join('\n') + '\n' + line.trim();

      lastLinePrinterLinesAgo = 0;
      printNextLines = configuration.head;
    } else {
      printNextLines--;

      if (printNextLines >= 0) {
        result = line + '\n';
      } else {
        result = '';
      }

      lastLinePrinterLinesAgo++;
    }

    return result ? result.trim() + '\n' : '';
  };

  return split((line) => {
    if (!isRoarrLine(line)) {
      return line + '\n';
    }

    try {
      return filterLog(line);
    } catch (error) {
      return formatInvalidInputMessage(
        configuration.chalk,
        error,
        line,
      );
    }
  });
};
