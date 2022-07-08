import prettyjson from 'prettyjson';
import {
  getLogLevelName,
} from 'roarr';
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

export const createLogFormatter = (configuration: LogFormatterConfigurationType) => {
  const {
    chalk,
  } = configuration;

  const logLevelColorMap = {
    debug: chalk.gray,
    error: chalk.red,
    fatal: chalk.red,
    info: chalk.cyan,
    trace: chalk.gray,
    warn: chalk.yellow,
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
    } catch (error) {
      return formatInvalidInputMessage(chalk, error, line);
    }
  });
};
