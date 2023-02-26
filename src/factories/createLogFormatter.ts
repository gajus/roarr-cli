import { type LogFormatterConfigurationType } from '../types';
import {
  extractRoarrMessage,
  findRoarrMessageLocation,
  formatInvalidInputMessage,
  formatMessage,
} from '../utilities';
import { type Message } from 'roarr';
import split from 'split2';

export const createLogFormatter = (
  configuration: LogFormatterConfigurationType,
) => {
  const { chalk, includeDate, useColors } = configuration;

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
