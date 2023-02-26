import { type FilterFunction, type LogFilterConfigurationType } from '../types';
import {
  extractRoarrMessage,
  findRoarrMessageLocation,
  formatInvalidInputMessage,
} from '../utilities';
import { parse, test } from 'liqe';
import { type Message } from 'roarr';
import split from 'split2';

const createTailingFilter = (
  head: number,
  lag: number,
  filter: FilterFunction,
) => {
  let lastLinePrinterLinesAgo = 0;
  let printNextLines = 0;
  let buffer: string[] = [];

  return (line: string, parsedMessage: Message) => {
    buffer.push(line);

    buffer = buffer.slice(-1 * lag - 1);

    let result: string;

    if (filter(parsedMessage)) {
      result =
        buffer.slice(-1 * lastLinePrinterLinesAgo - 1, -1).join('\n') +
        '\n' +
        line.trim();

      lastLinePrinterLinesAgo = 0;
      printNextLines = head;
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
};

export const createLogFilter = (configuration: LogFilterConfigurationType) => {
  const query = configuration.filterExpression
    ? parse(configuration.filterExpression)
    : null;

  const filterLog = createTailingFilter(
    configuration.head,
    configuration.lag,
    (message) => {
      if (
        configuration.filterFunction &&
        configuration.filterFunction(message) === false
      ) {
        return false;
      }

      if (query && test(query, message) === false) {
        return false;
      }

      return true;
    },
  );

  return split((line) => {
    const messageLocation = findRoarrMessageLocation(line);

    if (!messageLocation) {
      return line.trimEnd() + '\n';
    }

    const tokens = extractRoarrMessage(line, messageLocation);

    let parsedMessage: Message;

    try {
      parsedMessage = JSON.parse(tokens.body);
    } catch (error) {
      return (
        tokens.head +
        formatInvalidInputMessage(configuration.chalk, error, tokens.body) +
        tokens.tail
      );
    }

    return filterLog(line, parsedMessage);
  });
};
