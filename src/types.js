// @flow

import {
  Instance as Chalk,
} from 'chalk';

export type LogFilterConfigurationType = {|
  +chalk: Chalk,
  +excludeAlien: boolean,
  +filterExpression: string,
  +head: number,
  +lag: number,
|};

export type LogFormatterConfigurationType = {|
  +chalk: Chalk,
  +outputFormat: 'pretty' | 'json',
  +useColors: boolean,
|};
