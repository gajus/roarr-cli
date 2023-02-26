import { type Message } from 'roarr';

export type FilterFunction = (message: Message) => boolean;

export type RoarrConfigurationType = {
  readonly filterFunction: FilterFunction;
};

export type RemoteStream = {
  emit: (message: string) => void;
};
