import { createLogFormatter } from './createLogFormatter';
import chalk from 'chalk';
import { type Transform } from 'node:stream';
import { Readable } from 'node:stream';
import { expect, it } from 'vitest';

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

const trim = (text: string) => {
  return text.trimStart().trimEnd() + '\n';
};

it('pretty prints logs', async () => {
  const logs = `
{"context":{"logLevel":20},"message":"a","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20,"namespace":"foo"},"message":"b","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20,"program":"foo"},"message":"c","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20,"package":"foo"},"message":"d","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20,"foo":"bar"},"message":"e","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"f","sequence":0,"time":1,"version":"2.0.0"}
{"context":{"logLevel":20},"message":"g","sequence":0,"time":1,"version":"2.0.0"}
`.trim();

  const formatter = createLogFormatter({
    chalk,
    outputFormat: 'pretty',
  });

  await expect(feed(formatter, logs)).resolves.toEqual(
    trim(`
[00:00:00.001]       debug: a
[00:00:00.001]   0ms debug #foo: b
[00:00:00.001]   0ms debug %foo: c
[00:00:00.001]   0ms debug @foo: d
[00:00:00.001]   0ms debug: e
foo: bar
[00:00:00.001]   0ms debug: f
[00:00:00.001]   0ms debug: g
  `),
  );
});
