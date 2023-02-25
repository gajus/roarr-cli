import { type Chalk } from 'chalk';
import prettyMilliseconds from 'pretty-ms';
import prettyjson from 'prettyjson';
import { type Message } from 'roarr';
import { getLogLevelName } from 'roarr';

export const formatMessage = (
  message: Message,
  {
    includeDate,
    useColors,
    chalk,
  }: {
    chalk: Chalk;
    includeDate: boolean;
    useColors: boolean;
  },
): string => {
  const logLevelColorMap = {
    debug: chalk.gray,
    error: chalk.red,
    fatal: chalk.red,
    info: chalk.cyan,
    trace: chalk.gray,
    warn: chalk.yellow,
  };

  let formattedMessage = '';

  if (includeDate) {
    formattedMessage = '[' + new Date(message.time).toISOString() + ']';
  } else {
    formattedMessage =
      '[' + new Date(message.time).toISOString().slice(11, -1) + ']';
  }

  formattedMessage += chalk.yellow(
    prettyMilliseconds(1, { compact: true }).padStart(5),
  );

  if (
    message.context.logLevel &&
    typeof message.context.logLevel === 'number'
  ) {
    const logLevelName = getLogLevelName(message.context.logLevel);

    const logLevelColorName = useColors
      ? logLevelColorMap[logLevelName]
      : (text: string) => text;

    if (!logLevelColorName) {
      throw new Error('Unexpected state.');
    }

    if (message.context.logLevel % 10 === 0) {
      formattedMessage += ' ' + logLevelColorName(logLevelName);
    } else {
      formattedMessage +=
        ' ' +
        logLevelColorName(
          logLevelName + ' (' + String(message.context.logLevel) + ')',
        );
    }
  }

  if (message.context.package) {
    formattedMessage += ' @' + String(message.context.package);
  }

  if (message.context.program) {
    formattedMessage += ' %' + String(message.context.program);
  }

  if (message.context.namespace) {
    formattedMessage += ' #' + String(message.context.namespace);
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
      program: temporary6,
      ...rest
    } = message.context;

    /* eslint-enable @typescript-eslint/no-unused-vars */

    if (Object.keys(rest).length) {
      formattedMessage +=
        String(
          prettyjson.render(rest, {
            noColor: !useColors,
          }),
        ) + '\n\n';
    }
  }

  return formattedMessage;
};
