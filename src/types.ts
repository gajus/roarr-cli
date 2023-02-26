import { type Message } from 'roarr';

export type FilterFunction = (message: Message) => boolean;

export type RoarrConfiguration = {
  readonly filter: FilterFunction;
  readonly omit: readonly string[];
};

export type RemoteStream = {
  emit: (message: string) => void;
};
