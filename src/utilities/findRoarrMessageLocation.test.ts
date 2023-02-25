import { findRoarrMessageLocation } from './findRoarrMessageLocation';
import { expect, it } from 'vitest';

it('identifies Roarr message at the start of a string', () => {
  expect(
    findRoarrMessageLocation(
      '{"context":{"logLevel":20},"message":"foo","sequence":0,"time":1538037307418,"version":"2.0.0"}',
    ),
  ).toStrictEqual({
    end: 95,
    start: 0,
  });
});

it('identifies prefixed Roarr message', () => {
  expect(
    findRoarrMessageLocation(
      '   {"context":{"logLevel":20},"message":"foo","sequence":0,"time":1538037307418,"version":"2.0.0"}',
    ),
  ).toStrictEqual({
    end: 98,
    start: 3,
  });
});

it('returns null if Roarr message is not found', () => {
  expect(findRoarrMessageLocation('foo bar')).toBe(null);
});
