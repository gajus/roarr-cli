// @flow

import {
  Chalk,
} from 'chalk';
import type {
  MessageType,
} from 'roarr';

type FilterFunction = (message: MessageType) => boolean;

export type RoarrConfigurationType = {
  readonly filterFunction: FilterFunction,
};

export type LogFilterConfigurationType = {
  readonly chalk: Chalk,
  readonly filterExpression: null | string,
  readonly filterFunction: null | FilterFunction,
  readonly head: number,
  readonly lag: number,
};

export type LogFormatterConfigurationType = {
  readonly chalk: Chalk,
  readonly outputFormat: 'pretty' | 'json',
  readonly useColors: boolean,
};
