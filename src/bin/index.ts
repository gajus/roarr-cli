#!/usr/bin/env node
/* eslint-disable no-console */

import {
  createLogFilter,
  createLogFormatter,
  createRemoteStream,
} from '../factories';
import { createSeqForwarder } from '../forwarders';
import {
  type FilterFunction,
  type RemoteStream,
  type RoarrConfiguration,
} from '../types';
import {
  findNearestRoarrConfigurationPath,
  findRoarrMessageLocation,
} from '../utilities';
import { Instance as Chalk } from 'chalk';
import crypto from 'node:crypto';
import split from 'split2';
import yargs from 'yargs';

const argv = yargs
  .env('ROARR')
  .usage('Filters and formats Roarr log message.')
  .options({
    'api-key': {
      description:
        'roarr.io API key. Configuring API key automatically streams logs to roarr.io service.',
      type: 'string',
    },
    'api-url': {
      default: 'https://api.roarr.io',
      description: 'roarr.io API URL.',
      hidden: true,
      type: 'string',
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
    'include-date': {
      default: false,
      description:
        'Includes date in pretty output format. By default, date is not included.',
    },
    lag: {
      default: 0,
      description:
        'When filtering, print a number of lines trailing the match.',
      type: 'number',
    },
    name: {
      description:
        'Name of the application. Used by roarr.io to identify the source of logs.',
      type: 'string',
    },
    omit: {
      description:
        'Omit properties from the Roarr message, e.g. --omit context.version',
      type: 'array',
    },
    'output-format': {
      choices: ['pretty', 'json'] as const,
      default: 'pretty' as const,
    },
    pure: {
      default: false,
      description:
        'Excludes messages that cannot be recognized as Roarr log message.',
      type: 'boolean',
    },
    'remote-stream-type': {
      choices: ['seq'] as const,
    },
    'remote-stream-url': {
      description: 'URL of the remote stream.',
      type: 'string',
    },
    'stream-id': {
      description: 'roarr.io stream ID.',
      type: 'string',
    },
    tags: {
      description:
        'List of (comma separated) tags. Used by roarr.io to identify the source of logs.',
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

const UuidRegex =
  /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[\da-f]{4}-[\da-f]{12}$/iu;

const roarrConfigurationPath =
  findNearestRoarrConfigurationPath('.roarr.cjs') ??
  findNearestRoarrConfigurationPath('.roarr.js');

let filterFunction: FilterFunction | null = null;
let omitPaths: readonly string[] = [];

if (roarrConfigurationPath) {
  console.log('[@roarr/cli] loading %s configuration', roarrConfigurationPath);

  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const roarrConfiguration: RoarrConfiguration = require(roarrConfigurationPath);

  if (roarrConfiguration?.filter) {
    filterFunction = roarrConfiguration.filter;
  }

  if (roarrConfiguration?.omit) {
    omitPaths = roarrConfiguration.omit;
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

let stream = process.stdin.pipe(
  split((line) => {
    if (remoteStream) {
      remoteStream.emit(line);
    }

    if (!findRoarrMessageLocation(line)) {
      return argv.pure ? '' : line + '\n';
    }

    return line + '\n';
  }),
);

if (argv['remote-stream-type'] === 'seq' && argv['remote-stream-url']) {
  stream.pipe(createSeqForwarder(argv['remote-stream-url']));
}

if (argv.filter || filterFunction) {
  stream = stream.pipe(
    createLogFilter({
      chalk,
      filterExpression: argv.filter ?? null,
      filterFunction,
      head: argv.head,
      lag: argv.lag,
    }),
  );
}

stream = stream.pipe(
  createLogFormatter({
    chalk,
    includeDate: argv['include-date'],
    omitPaths: argv['omit'] ? (argv['omit'] as readonly string[]) : omitPaths,
    outputFormat: argv['output-format'],
    useColors: argv['use-colors'],
  }),
);

stream.pipe(process.stdout);

let firstSigint = true;

process.on('SIGINT', () => {
  if (firstSigint) {
    firstSigint = false;

    console.log(
      '[@roarr/cli] received SIGINT; waiting for the stream to close',
    );

    return;
  }

  console.log('[@roarr/cli] received second SIGINT; force exiting');

  // eslint-disable-next-line node/no-process-exit
  process.exit(1);
});
