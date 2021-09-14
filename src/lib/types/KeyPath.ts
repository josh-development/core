import type { StringArray } from './StringArray';

export type KeyPathArray = [string, StringArray | undefined];

export type KeyPath = string | KeyPathArray;
