import { formatMessage } from './formatMessage';
import chalk from 'chalk';
import { expect, it } from 'vitest';

it('pretty prints Roarr message', () => {
  const lastMessageTime = 1_538_037_307_418;

  expect(
    formatMessage(
      {
        context: { logLevel: 20 },
        message: 'foo',
        sequence: '0',
        time: lastMessageTime,
        version: '2.0.0',
      },
      {
        chalk,
        includeDate: true,
        lastMessageTime: lastMessageTime - 100,
        useColors: false,
      },
    ),
  ).toBe('[2018-09-27T08:35:07.418Z] 100ms debug: foo\n');
});
