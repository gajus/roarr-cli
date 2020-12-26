// @flow

import {
  Instance as Chalk,
} from 'chalk';
import type {
  MessageType,
} from 'roarr';

export type RoarrConfigurationType = {|
  +filterFunction: (message: MessageType) => boolean,
|};

export type LogFilterConfigurationType = {|
  +chalk: Chalk,
  +filterExpression: null | string,
  +filterFunction: null | (message: MessageType) => boolean,
  +head: number,
  +lag: number,
|};

export type LogFormatterConfigurationType = {|
  +chalk: Chalk,
  +outputFormat: 'pretty' | 'json',
  +useColors: boolean,
|};
