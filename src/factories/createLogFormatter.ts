import { type LogFormatterConfigurationType } from '../types';
import {
  findRoarrMessageLocation,
  formatInvalidInputMessage,
  formatMessage,
} from '../utilities';
import split from 'split2';

export const createLogFormatter = (
  configuration: LogFormatterConfigurationType,
) => {
  const { chalk, includeDate, useColors } = configuration;

  const logLevelColorMap = {
    debug: chalk.gray,
    error: chalk.red,
    fatal: chalk.red,
    info: chalk.cyan,
    trace: chalk.gray,
    warn: chalk.yellow,
  };

  return split((line) => {
    const messageLocation = findRoarrMessageLocation(line);

    if (!messageLocation) {
      return line + '\n';
    }

    const head = line.slice(0, messageLocation.start);
    const body = line.slice(
      messageLocation.start,
      messageLocation.start + messageLocation.end,
    );
    const tail = line.slice(messageLocation.end);

    let formattedMessage: string;

    try {
      formattedMessage = formatMessage(JSON.parse(body), {
        includeDate,
        logLevelColorMap,
        useColors,
      });
    } catch (error) {
      formattedMessage = formatInvalidInputMessage(chalk, error, body);
    }

    if (messageLocation.start === 0) {
      return formattedMessage;
    }

    return head + formattedMessage + tail;
  });
};
