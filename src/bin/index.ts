#!/usr/bin/env node

import crypto from 'node:crypto';
import {
  Instance as Chalk,
} from 'chalk';
import split from 'split2';
import yargs from 'yargs';
import {
  createLogFilter,
  createLogFormatter,
  createRemoteStream,
} from '../factories';
import type {
  FilterFunction,
  RoarrConfigurationType,
  RemoteStream,
} from '../types';
import {
  findNearestRoarrConfigurationPath,
  isRoarrLine,
} from '../utilities';

const argv = yargs
  .env('ROARR')
  .usage('Filters and formats Roarr log message.')
  .options({
    'api-key': {
      description: 'roarr.io API key. Configuring API key automatically streams logs to roarr.io service.',
      type: 'string',
    },
    'api-url': {
      default: 'https://api.roarr.io',
      description: 'roarr.io API URL.',
      hidden: true,
      type: 'string',
    },
    'exclude-alien': {
      default: false,
      description: 'Excludes messages that cannot be recognized as Roarr log message.',
      type: 'boolean',
    },
    filter: {
      description: 'Roarr message Liqe filter expression.',
      type: 'string',
    },
    head: {
      default: 0,
      description: 'When filtering, print a number of lines leading the match.',
      type: 'number',
    },
    lag: {
      default: 0,
      description: 'When filtering, print a number of lines trailing the match.',
      type: 'number',
    },
    name: {
      description: 'Name of the application. Used by roarr.io to identify the source of logs.',
      type: 'string',
    },
    'output-format': {
      choices: [
        'pretty',
        'json',
      ],
      default: 'pretty',
    },
    'stream-id': {
      description: 'roarr.io stream ID.',
      type: 'string',
    },
    tags: {
      description: 'List of (comma separated) tags. Used by roarr.io to identify the source of logs.',
      type: 'string',
    },
    'use-colors': {
      default: true,
      description: 'Toggle use of colors in the output.',
      type: 'boolean',
    },
  })
  .help()
  .wrap(80)
  .parseSync();

const UuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/ui;

const roarrConfigurationPath = findNearestRoarrConfigurationPath('.roarr.cjs') ?? findNearestRoarrConfigurationPath('.roarr.js');

let filterFunction: FilterFunction | null = null;

if (roarrConfigurationPath) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const roarrConfiguration: RoarrConfigurationType = require(roarrConfigurationPath);

  if (roarrConfiguration?.filterFunction) {
    filterFunction = roarrConfiguration.filterFunction;
  }
}

const chalk = new Chalk({
  level: argv['use-colors'] ? 3 : 0,
});

let remoteStream: RemoteStream;

if (argv['stream-id'] && !UuidRegex.test(argv['stream-id'])) {
  throw new Error('stream-id must be a valid UUID');
}

if (argv['api-key']) {
  if (!UuidRegex.test(argv['api-key'])) {
    throw new Error('api-key must be a valid UUID');
  }

  remoteStream = createRemoteStream(
    argv['api-url'],
    argv['api-key'],
    argv['stream-id'] ?? crypto.randomUUID(),
    argv.name ?? '',
    argv.tags ?? '',
  );
}

let stream = process.stdin
  .pipe(split((line) => {
    if (remoteStream) {
      remoteStream.emit(line);
    }

    if (!isRoarrLine(line)) {
      return argv.excludeAlien ? '' : line + '\n';
    }

    return line + '\n';
  }));

if (argv.filter || filterFunction) {
  stream = stream.pipe(createLogFilter({
    chalk,
    filterExpression: argv.filter ?? null,
    filterFunction,
    head: argv.head,
    lag: argv.lag,
  }));
}

if (argv['output-format'] === 'pretty') {
  stream = stream.pipe(createLogFormatter({
    chalk,
    outputFormat: argv['output-format'],
    useColors: argv['use-colors'],
  }));
}

stream.pipe(process.stdout);

process.on('SIGINT', () => {
  setTimeout(() => {
    // eslint-disable-next-line node/no-process-exit
    process.exit();
  }, 250);
});
