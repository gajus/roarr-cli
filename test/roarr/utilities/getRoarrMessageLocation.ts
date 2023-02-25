import { findRoarrMessageLocation } from '../../../src/utilities/findRoarrMessageLocation';
import test from 'ava';

test('identifies Roarr line', (t) => {
  t.deepEqual(
    findRoarrMessageLocation(
      '{"context":{"logLevel":20},"message":"foo","sequence":0,"time":1538037307418,"version":"2.0.0"}',
    ),
    {
      end: 77,
      start: 0,
    },
  );
  t.is(findRoarrMessageLocation('foo bar'), null);
});
