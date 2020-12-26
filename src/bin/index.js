#!/usr/bin/env node

// @flow

import {
  Instance as Chalk,
} from 'chalk';
import JSON5 from 'json5';
import split from 'split2';
import yargs from 'yargs';
import {
  createLogFormatter,
  createLogFilter,
} from '../factories';
import type {
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
    'exclude-alien': {
      default: false,
      description: 'Excludes messages that cannot be recognized as Roarr log message.',
      type: 'boolean',
    },
    'filter-expression': {
      alias: 'fe',
      description: 'Roarr message filter expression.',
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

let filterFunction = null;

if (roarrConfigurationPath) {
  /* eslint-disable global-require, import/no-dynamic-require */
  // $FlowFixMe
  const roarrConfiguration: RoarrConfigurationType = require(roarrConfigurationPath);

  /* eslint-enable */

  if (roarrConfiguration && roarrConfiguration.filterFunction) {
    filterFunction = roarrConfiguration.filterFunction;
  }
}

const chalk = new Chalk({
  enabled: argv.useColors,
});

let stream = process.stdin
  .pipe(split((line) => {
    if (!isRoarrLine(line)) {
      return argv.excludeAlien ? '' : line + '\n';
    }

    return line + '\n';
  }));

if (argv.filterExpression || filterFunction) {
  const filterExpressions = argv.filterExpression ? JSON5.parse(argv.filterExpression) : null;

  stream = stream.pipe(createLogFilter({
    chalk,
    filterExpression: filterExpressions,
    filterFunction,
    head: argv.head,
    lag: argv.lag,
  }));
}

if (argv.outputFormat === 'pretty') {
  stream = stream.pipe(createLogFormatter({
    chalk,
    outputFormat: argv.outputFormat,
    useColors: argv.useColors,
  }));
}

stream.pipe(process.stdout);
