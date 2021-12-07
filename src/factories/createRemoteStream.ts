import os from 'node:os';
import {
  io,
} from 'socket.io-client';
import type {
  RemoteStream,
} from '../types';

type StreamConfiguration = {
  enabled: boolean,
};

export const createRemoteStream = (
  apiUrl: string,
  apiKey: string,
  streamId: string,
  name: string,
  tags: string,
): RemoteStream => {
  let buffer: string[] = [];
  let streamConfiguration: StreamConfiguration;

  const socket = io(apiUrl, {
    autoUnref: true,
    query: {
      hostname: os.hostname(),
      name: name || '',
      stream: streamId,
      tags: tags || '',
      token: apiKey,
      version: '1.0.0',
    },
  });

  socket.on('stream_configuration', (nextStreamConfiguration) => {
    streamConfiguration = nextStreamConfiguration;
  });

  setInterval(() => {
    if (buffer.length > 0) {
      socket.emit('messages', buffer.join('\n'));

      buffer = [];
    }
  }, 100).unref();

  return {
    emit: (message: string) => {
      if (!streamConfiguration || !streamConfiguration.enabled) {
        return;
      }

      buffer.push(message);
    },
  };
};
