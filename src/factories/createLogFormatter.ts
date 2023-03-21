import {
  extractRoarrMessage,
  findRoarrMessageLocation,
  formatInvalidInputMessage,
  formatMessage,
} from '../utilities';
import { type Chalk } from 'chalk';
import dotProp from 'dot-prop';
import { type Message } from 'roarr';
import split from 'split2';

export const createLogFormatter = (configuration: {
  readonly chalk: Chalk;
  readonly includeDate?: boolean;
  readonly omitPaths?: readonly string[];
  readonly outputFormat: 'json' | 'pretty';
  readonly useColors?: boolean;
}) => {
  const {
    chalk,
    includeDate = false,
    useColors = false,
    omitPaths = [],
  } = configuration;

  let lastMessageTime: number;

  return split((line) => {
    const messageLocation = findRoarrMessageLocation(line);

    if (!messageLocation) {
      return line + '\n';
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

    for (const omitPath of omitPaths) {
      dotProp.delete(parsedMessage, omitPath);
    }

    const formattedMessage = formatMessage(parsedMessage, {
      chalk,
      includeDate,
      lastMessageTime,
      useColors,
    });

    lastMessageTime = parsedMessage.time;

    return tokens.head + formattedMessage + tokens.tail;
  });
};
