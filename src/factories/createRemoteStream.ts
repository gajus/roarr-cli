import os from 'node:os';
import {
  io,
} from 'socket.io-client';
import {
  throttle,
} from 'throttle-debounce';
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

  const emit = throttle(
    100,
    false,
    () => {
      socket.emit('messages', buffer.join('\n'));

      buffer = [];
    },
  );

  return {
    emit: (message: string) => {
      if (!streamConfiguration || !streamConfiguration.enabled) {
        return;
      }

      buffer.push(message);

      emit();
    },
  };
};
