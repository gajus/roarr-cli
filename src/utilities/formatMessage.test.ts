import { formatMessage } from './formatMessage';
import chalk from 'chalk';
import { expect, it } from 'vitest';

it('pretty prints Roarr message', () => {
  expect(
    formatMessage(
      {
        context: { logLevel: 20 },
        message: 'foo',
        sequence: '0',
        time: 1_538_037_307_418,
        version: '2.0.0',
      },
      { chalk, includeDate: true, useColors: false },
    ),
  ).toBe('[2018-09-27T08:35:07.418Z]  1ms debug: foo\n');
});
