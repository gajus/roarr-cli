import { isRoarrLine } from '../../../src/utilities/isRoarrLine';
import test from 'ava';

test('identifies Roarr line', (t) => {
  t.true(
    isRoarrLine(
      '{"context":{"package":"@applaudience/cinema-data-scraper","namespace":"scrape","logLevel":20,"scraperPaths":["dist/countries/gb/picturehouse.js"]},"message":"received 1 scraper paths","sequence":0,"time":1538037307418,"version":"1.0.0"}',
    ),
  );
  t.false(isRoarrLine('foo bar'));
});
