import prettyjson from 'prettyjson';
import type {
  Message,
} from 'roarr';
import split from 'split2';
import type {
  LogFormatterConfigurationType,
} from '../types';
import {
  formatInvalidInputMessage,
  isRoarrLine,
} from '../utilities';

/* eslint-disable quote-props */
const logLevels = {
  '10': 'TRACE',
  '20': 'DEBUG',
  '30': 'INFO',
  '40': 'WARN',
  '50': 'ERROR',
  '60': 'FATAL',
};
/* eslint-enable */

export const createLogFormatter = (configuration: LogFormatterConfigurationType) => {
  const chalk = configuration.chalk;

  const logLevelColorMap = {
    DEBUG: chalk.gray,
    ERROR: chalk.red,
    FATAL: chalk.red,
    INFO: chalk.cyan,
    TRACE: chalk.gray,
    WARN: chalk.yellow,
  };

  const getLogLevelName = (logLevel: number): string => {
    return logLevels[logLevel] || 'INFO';
  };

  const formatMessage = (message: Message): string => {
    let formattedMessage = '';

    formattedMessage = '[' + new Date(message.time).toISOString() + ']';

    if (message.context.logLevel && typeof message.context.logLevel === 'number') {
      const logLevelName = getLogLevelName(message.context.logLevel);

      const logLevelColorName = logLevelColorMap[logLevelName];

      if (!logLevelColorName) {
        throw new Error('Unexpected state.');
      }

      formattedMessage += ' ' + logLevelColorName(logLevelName + ' (' + String(message.context.logLevel) + ')');
    }

    if (message.context.package) {
      formattedMessage += ' (@' + String(message.context.package) + ')';
    }

    if (message.context.namespace) {
      formattedMessage += ' (#' + String(message.context.namespace) + ')';
    }

    formattedMessage += ': ' + message.message + '\n';

    if (message.context) {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        application: temporary0,
        hostname: temporary1,
        instanceId: temporary2,
        logLevel: temporary3,
        namespace: temporary4,
        package: temporary5,
        package: temporary6,
        ...rest
      } = message.context;

      /* eslint-enable @typescript-eslint/no-unused-vars */

      if (Object.keys(rest).length) {
        formattedMessage += String(prettyjson.render(rest, {
          noColor: !configuration.useColors,
        })) + '\n\n';
      }
    }

    return formattedMessage;
  };

  return split((line) => {
    if (!isRoarrLine(line)) {
      return line + '\n';
    }

    try {
      return formatMessage(JSON.parse(line));
    } catch (error: any) {
      return formatInvalidInputMessage(chalk, error, line);
    }
  });
};
