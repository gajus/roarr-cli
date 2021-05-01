#!/usr/bin/env node

/* eslint-disable node/shebang */

import {
  Instance as Chalk,
} from 'chalk';
import JSON5 from 'json5';
import {
  io,
} from 'socket.io-client';
import split from 'split2';
import yargs from 'yargs';
import {
  createLogFormatter,
  createLogFilter,
} from '../factories';
import type {
  FilterFunction,
  RoarrConfigurationType,
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
      default: 'https://roarr.io',
      description: 'roarr.io API URL.',
      hidden: true,
      type: 'string',
    },
    'exclude-alien': {
      default: false,
      description: 'Excludes messages that cannot be recognized as Roarr log message.',
      type: 'boolean',
    },
    'filter-expression': {
      alias: 'fe',
      description: 'Roarr message filter expression.',
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
    'output-format': {
      choices: [
        'pretty',
        'json',
      ],
      default: 'pretty',
    },
    'use-colors': {
      default: true,
      description: 'Toggle use of colors in the output.',
      type: 'boolean',
    },
  })
  .help()
  .wrap(80)
  .parse();

const roarrConfigurationPath = findNearestRoarrConfigurationPath();

let filterFunction: FilterFunction | null = null;

if (roarrConfigurationPath) {
  /* eslint-disable node/global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires */
  const roarrConfiguration: RoarrConfigurationType = require(roarrConfigurationPath);

  /* eslint-enable */

  if (roarrConfiguration?.filterFunction) {
    filterFunction = roarrConfiguration.filterFunction;
  }
}

const chalk = new Chalk({
  level: argv['use-colors'] ? 3 : 0,
});

let socket;

if (argv['api-key']) {
  socket = io(argv['api-url'], {
    query: {
      token: String(argv['api-key']),
    },
  });
}

let stream = process.stdin
  .pipe(split((line) => {
    if (socket) {
      socket.emit('log', line);
    }

    if (!isRoarrLine(line)) {
      return argv.excludeAlien ? '' : line + '\n';
    }

    return line + '\n';
  }));

if (argv['filter-expression'] || filterFunction) {
  const filterExpressions = argv['filter-expression'] ? JSON5.parse(argv['filter-expression']) : null;

  stream = stream.pipe(createLogFilter({
    chalk,
    filterExpression: filterExpressions,
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

