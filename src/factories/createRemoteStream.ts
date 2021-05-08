import os from 'os';
import {
  io,
} from 'socket.io-client';
import {
  throttle,
} from 'throttle-debounce';

export const createRemoteStream = (
  apiUrl: string,
  apiKey: string,
  name: string,
  tags: string,
) => {
  let buffer: string[] = [];
  let streamConfiguration;

  const socket = io(apiUrl, {
    query: {
      hostname: os.hostname(),
      name: name || '',
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
      if (!streamConfiguration.enabled) {
        return;
      }

      buffer.push(message);

      emit();
    },
  };
};
