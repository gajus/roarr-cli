import { formatMessage } from './formatMessage';
import chalk from 'chalk';
import { expect, it } from 'vitest';

it('pretty prints Roarr message', () => {
  const logLevelColorMap = {
    debug: chalk.gray,
    error: chalk.red,
    fatal: chalk.red,
    info: chalk.cyan,
    trace: chalk.gray,
    warn: chalk.yellow,
  };

  expect(
    formatMessage(
      {
        context: { logLevel: 20 },
        message: 'foo',
        sequence: '0',
        time: 1_538_037_307_418,
        version: '2.0.0',
      },
      { includeDate: true, logLevelColorMap, useColors: false },
    ),
  ).toBe('[2018-09-27T08:35:07.418Z] debug: foo\n');
});
