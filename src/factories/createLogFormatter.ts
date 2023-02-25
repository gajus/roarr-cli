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
    if (!findRoarrMessageLocation(line)) {
      return line + '\n';
    }

    try {
      return formatMessage(JSON.parse(line), {
        includeDate,
        logLevelColorMap,
        useColors,
      });
    } catch (error) {
      return formatInvalidInputMessage(chalk, error, line);
    }
  });
};
