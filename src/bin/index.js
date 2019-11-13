#!/usr/bin/env node

// @flow

import yargs from 'yargs';
import split from 'split2';
import {
  Instance as Chalk,
} from 'chalk';
import {
  createLogFormatter,
  createLogFilter,
} from '../factories';

const argv = yargs
  .env('ROARR')
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
      default: 2,
      description: 'When filtering, print a number of lines leading the match.',
      type: 'number',
    },
    lag: {
      default: 2,
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

const chalk = new Chalk({
  enabled: argv.useColors,
});

process.stdin
  .pipe(createLogFilter({
    chalk,
    excludeAlien: argv.excludeAlien,
    filterExpression: argv.filterExpression,
    head: argv.head,
    lag: argv.lag,
  }))
  .pipe(createLogFormatter({
    chalk,
    outputFormat: argv.outputFormat,
    useColors: argv.useColors,
  }))
  .pipe(process.stdout);
