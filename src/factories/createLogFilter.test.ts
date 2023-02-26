import { createLogFilter } from './createLogFilter';
import chalk from 'chalk';
import { type Transform } from 'node:stream';
import { Readable } from 'node:stream';
import { expect, it } from 'vitest';

const logs = `
{"context":{"logLevel":20},"message":"a","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"b","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"c","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"d","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"e","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"f","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"g","sequence":0,"time":1,"version":"2.0.0"}
`.trim();

const feed = (transform: Transform, text: string) => {
  return new Promise((resolve) => {
    const stream = new Readable();

    stream.pipe(transform);

    for (const line of text.split('\n')) {
      stream.push(line + '\n');
    }

    stream.push(null);

    const buffer: string[] = [];

    stream.on('end', () => {
      resolve(buffer.join(''));
    });

    transform.on('data', (data) => {
      buffer.push(data);
    });
  });
};

it('keeps all logs by default', async () => {
  const filter = createLogFilter({
    chalk,
    head: 0,
    lag: 0,
  });

  await expect(feed(filter, logs)).resolves.toEqual(logs + '\n');
});

it('keeps only matching logs', async () => {
  const filter = createLogFilter({
    chalk,
    filterExpression: 'message:a OR message:c',
    head: 0,
    lag: 0,
  });

  const expected = `
{"context":{"logLevel":20},"message":"a","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"c","sequence":0,"time":1,"version":"2.0.0"}
`.trimStart();

  await expect(feed(filter, logs)).resolves.toEqual(expected);
});

it('adds lag', async () => {
  const filter = createLogFilter({
    chalk,
    filterExpression: 'message:a OR message:c',
    head: 0,
    lag: 1,
  });

  const expected = `
{"context":{"logLevel":20},"message":"a","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"b","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"c","sequence":0,"time":1,"version":"2.0.0"}
`.trimStart();

  await expect(feed(filter, logs)).resolves.toEqual(expected);
});

it('adds head', async () => {
  const filter = createLogFilter({
    chalk,
    filterExpression: 'message:a OR message:c',
    head: 1,
    lag: 0,
  });

  const expected = `
{"context":{"logLevel":20},"message":"a","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"b","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"c","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"d","sequence":0,"time":1,"version":"2.0.0"}
`.trimStart();

  await expect(feed(filter, logs)).resolves.toEqual(expected);
});

// TODO known bug
it.skip('adds lag and head', async () => {
  const filter = createLogFilter({
    chalk,
    filterExpression: 'message:a OR message:c',
    head: 1,
    lag: 1,
  });

  const expected = `
{"context":{"logLevel":20},"message":"a","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"b","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"c","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"d","sequence":0,"time":1,"version":"2.0.0"}
`.trimStart();

  await expect(feed(filter, logs)).resolves.toEqual(expected);
});
