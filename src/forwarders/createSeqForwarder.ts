/* eslint-disable promise/prefer-await-to-then */

import { extractRoarrMessage, findRoarrMessageLocation } from '../utilities';
import { Writable } from 'node:stream';
import { type Message } from 'roarr';
import { getLogLevelName } from 'roarr';
import { Logger } from 'seq-logging';

const logLevelMap = {
  debug: 'Debug',
  error: 'Error',
  fatal: 'Fatal',
  info: 'Information',
  trace: 'Verbose',
  warn: 'Warning',
};

export const createSeqForwarder = (serverUrl: string) => {
  const logger = new Logger({
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error('Seq Forwarder', error);
    },
    serverUrl,
  });

  class SeqStream extends Writable {
    public _write(
      chunk: Buffer,
      encoding: BufferEncoding,
      callback: (error?: Error | null | undefined) => void,
    ): void {
      const line = chunk.toString();

      const messageLocation = findRoarrMessageLocation(line);

      if (!messageLocation) {
        return;
      }

      const tokens = extractRoarrMessage(line, messageLocation);

      const message = JSON.parse(tokens.body);

      logger.emit({
        level:
          logLevelMap[
            getLogLevelName(
              message.context.logLevel ? Number(message.context.logLevel) : 0,
            )
          ],
        messageTemplate: message.message,
        properties: message.context,
        timestamp: new Date(message.time),
      });

      callback();
    }

    public _final(callback) {
      logger
        .close()
        .then(() => callback())
        .catch((error) => callback(error));
    }
  }

  return new SeqStream();
};
