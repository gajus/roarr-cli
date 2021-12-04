// @flow

import type {
  Chalk,
} from 'chalk';
import type {
  Message,
} from 'roarr';

export type FilterFunction = (message: Message) => boolean;

export type RoarrConfigurationType = {
  readonly filterFunction: FilterFunction,
};

export type LogFilterConfigurationType = {
  readonly chalk: Chalk,
  readonly filterExpression: string | null,
  readonly filterFunction: FilterFunction | null,
  readonly head: number,
  readonly lag: number,
};

export type LogFormatterConfigurationType = {
  readonly chalk: Chalk,
  readonly outputFormat: 'json' | 'pretty',
  readonly useColors: boolean,
};

export type RemoteStream = {
  emit: (message: string) => void,
};
