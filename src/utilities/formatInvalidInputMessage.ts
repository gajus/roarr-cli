import { type Chalk } from 'chalk';

export const formatInvalidInputMessage = (
  chalk: Chalk,
  error: Error,
  input: string,
): string => {
  return (
    chalk.red(
      'Cannot parse presumed Roarr log message as JSON [' +
        error.name +
        ': ' +
        error.message +
        ']',
    ) +
    '\n' +
    chalk.gray('---INVALID INPUT START---') +
    '\n' +
    input +
    '\n' +
    chalk.gray('---INVALID INPUT END---')
  );
};
