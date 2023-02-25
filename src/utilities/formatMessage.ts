import prettyjson from 'prettyjson';
import { type LogLevelName, type Message } from 'roarr';
import { getLogLevelName } from 'roarr';

type LogLevelColorMap = {
  [K in LogLevelName]: (message: string) => string;
};

export const formatMessage = (
  message: Message,
  {
    includeDate,
    logLevelColorMap,
    useColors,
  }: {
    includeDate: boolean;
    logLevelColorMap: LogLevelColorMap;
    useColors: boolean;
  },
): string => {
  let formattedMessage = '';

  if (includeDate) {
    formattedMessage = '[' + new Date(message.time).toISOString() + ']';
  } else {
    formattedMessage =
      '[' + new Date(message.time).toISOString().slice(11, -1) + ']';
  }

  if (
    message.context.logLevel &&
    typeof message.context.logLevel === 'number'
  ) {
    const logLevelName = getLogLevelName(message.context.logLevel);

    const logLevelColorName = logLevelColorMap[logLevelName];

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
