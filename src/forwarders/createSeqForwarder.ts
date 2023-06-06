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
    maxRetries: 5,
    onError: (error) => {
      if ('code' in error && error.code === 'ECONNREFUSED') {
        // eslint-disable-next-line no-console
        console.warn('[Seq Forwarder Error] cannot connect to Seq server');
      } else {
        // eslint-disable-next-line no-console
        console.error('[Seq Forwarder Error]', error);
      }
    },
    retryDelay: 5_000,
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
        callback();

        return;
      }

      const tokens = extractRoarrMessage(line, messageLocation);

      let message: Message;

      try {
        message = JSON.parse(tokens.body);
      } catch {
        callback();

        return;
      }

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
