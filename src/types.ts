import { type Message } from 'roarr';

export type FilterFunction = (message: Message) => boolean;

export type RoarrConfigurationType = {
  readonly filter: FilterFunction;
};

export type RemoteStream = {
  emit: (message: string) => void;
};
