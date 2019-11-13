#!/usr/bin/env node

// @flow

import yargs from 'yargs';
import split from 'split2';
import JSON5 from 'json5';
import {
  Instance as Chalk,
} from 'chalk';
import {
  createLogFormatter,
  createLogFilter,
} from '../factories';
import {
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

let stream = process.stdin
  .pipe(split((line) => {
    if (!isRoarrLine(line)) {
      return argv.excludeAlien ? '' : line + '\n';
    }

    return line + '\n';
  }));

if (argv.filterExpression.length > 0) {
  const filterExpressions = JSON5.parse(argv.filterExpression);

  stream = stream.pipe(createLogFilter({
    chalk,
    filterExpression: filterExpressions,
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
