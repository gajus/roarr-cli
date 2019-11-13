// @flow

import JSON5 from 'json5';
import split from 'split2';
import {
  matchObject,
} from 'searchjs';
import {
  formatInvalidInputMessage,
  isRoarrLine,
} from '../utilities';
import type {
  LogFilterConfigurationType,
} from '../types';

export default (configuration: LogFilterConfigurationType) => {
  let lastLinePrinterLinesAgo = 0;
  let printNextLines = 0;
  let buffer = [];

  const filterExpression = configuration.filterExpression && JSON5.parse(configuration.filterExpression);

  const filterLog = (line: string) => {
    buffer.push(line);

    buffer = buffer.slice(-1 * configuration.lag - 1);

    const subject = JSON.parse(line);

    let result;

    if (matchObject(subject, filterExpression)) {
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

    return result.trim() + '\n';
  };

  return split((line) => {
    if (!isRoarrLine(line)) {
      return configuration.excludeAlien ? '' : line + '\n';
    }

    if (!filterExpression) {
      return line + '\n';
    }

    try {
      return filterLog(line);
    } catch (error) {
      return formatInvalidInputMessage(configuration.chalk, error, line);
    }
  });
};
