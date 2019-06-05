// @flow

import split from 'split2';
import {constructor as Chalk} from 'chalk';
import prettyjson from 'prettyjson';
import type {
  MessageType
} from 'roarr';
import {
  isRoarrLine
} from './utilities';

type ArgvType = {|
  +excludeOrphans: boolean,
  +includeContext: boolean,
  +useColors: boolean
|};

type LogFormatterConfigurationType = {|
  +includeContext: boolean,
  +excludeOrphans: boolean,
  +useColors: boolean
|};

/* eslint-disable quote-props */
const logLevels = {
  '10': 'TRACE',
  '20': 'DEBUG',
  '30': 'INFO',
  '40': 'WARN',
  '50': 'ERROR',
  '60': 'FATAL'
};
/* eslint-enable */

export const command = 'pretty-print';
export const desc = 'Format logs for user-inspection.';

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      'exclude-orphans': {
        default: false,
        description: 'Excludes messages that cannot be recognized as Roarr log message.',
        type: 'boolean'
      },
      'include-context': {
        default: true,
        description: 'Includes message context payload.',
        type: 'boolean'
      },
      'use-colors': {
        default: true,
        description: 'Toggle use of colors in the output.',
        type: 'boolean'
      }
    });
};

export const handler = (argv: ArgvType) => {
  const chalk = new Chalk({
    enabled: argv.useColors
  });

  const logLevelColorMap = {
    DEBUG: chalk.gray,
    ERROR: chalk.red,
    FATAL: chalk.red,
    INFO: chalk.cyan,
    TRACE: chalk.gray,
    WARN: chalk.yellow
  };

  const getLogLevelName = (logLevel: number): string => {
    return logLevels[logLevel] || 'INFO';
  };

  const formatMessage = (configuration: LogFormatterConfigurationType, message: MessageType): string => {
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

    if (configuration.includeContext && message.context) {
      /* eslint-disable no-unused-vars */
      const {
        application: termporary0,
        hostname: termporary1,
        instanceId: termporary2,
        logLevel: termporary3,
        namespace: termporary4,
        package: termporary5,
        package: termporary6,
        ...rest
      } = message.context;

      /* eslint-enable */

      if (Object.keys(rest).length) {
        // eslint-disable-next-line no-console
        formattedMessage += prettyjson.render(rest, {
          noColor: !argv.useColors
        }) + '\n\n';
      }
    }

    return formattedMessage;
  };

  const formatInvalidInputMessage = (error: Error, input: string): string => {
    return chalk.red('Cannot parse presumed Roarr log message as JSON [' + error.name + ': ' + error.message + ']') +
      '\n' + chalk.gray('---INVALID INPUT START---') +
      '\n' + input +
      '\n' + chalk.gray('---INVALID INPUT END---');
  };

  const createLogFormatter = (configuration: LogFormatterConfigurationType) => {
    const stream = split((line) => {
      if (!isRoarrLine(line)) {
        return configuration.excludeOrphans ? '' : line + '\n';
      }

      let parsedMessage;

      try {
        parsedMessage = JSON.parse(line);
      } catch (error) {
        return formatInvalidInputMessage(error, line);
      }

      return formatMessage(configuration, parsedMessage);
    });

    return stream;
  };

  process.stdin
    .pipe(createLogFormatter(argv))
    .pipe(process.stdout);
};
