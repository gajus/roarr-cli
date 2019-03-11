// @flow

import split from 'split2';
import through from 'through2';
import {
  matchObject
} from 'searchjs';
import JSON5 from 'json5';
import {
  isRoarrLine
} from './utilities';

type ArgvType = {|
  +context: number,
  +excludeOrphans: boolean,
  +searchExpression: string
|};

type LogFilterConfigurationType = {|
  +context: number,
  +excludeOrphans: boolean,
  // eslint-disable-next-line flowtype/no-weak-types
  +searchExpression: Object
|};

let lastLinePrinterLinesAgo = 0;
let printNextLines = 0;
let buffer = [];

const filterLog = (configuration: LogFilterConfigurationType, line: string, callback: (error?: Error, line?: string) => {}) => {
  if (!isRoarrLine(line)) {
    callback(undefined, configuration.excludeOrphans ? '' : line + '\n');

    return;
  }

  buffer.push(line);

  buffer = buffer.slice(-1 * configuration.context - 1);

  try {
    const subject = JSON.parse(line);

    let result;

    if (matchObject(subject, configuration.searchExpression)) {
      result = buffer.slice(-1 * lastLinePrinterLinesAgo - 1, -1).join('\n') + '\n' + line;

      lastLinePrinterLinesAgo = 0;
      printNextLines = configuration.context;
    } else {
      printNextLines--;

      if (printNextLines >= 0) {
        result = line + '\n';
      } else {
        result = '';
      }

      lastLinePrinterLinesAgo++;
    }

    callback(undefined, result);
  } catch (error) {
    callback(error);
  }
};

export const command = 'filter <search-expression>';
export const desc = 'Filter Roarr messages using jq.';

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      context: {
        default: 2,
        description: 'Print a number of lines leading and trailing context surrounding each match.',
        type: 'number'
      },
      'exclude-orphans': {
        default: false,
        description: 'Excludes messages that cannot be recognized as Roarr log message.',
        type: 'boolean'
      }
    });
};

export const handler = (argv: ArgvType) => {
  // argv
  process.stdin
    .pipe(split())
    .pipe(through((chunk, encoding, callback) => {
      const line = chunk.toString();

      filterLog(
        {
          ...argv,
          searchExpression: JSON5.parse(argv.searchExpression)
        },
        line,
        callback
      );
    }))
    .pipe(process.stdout);
};
