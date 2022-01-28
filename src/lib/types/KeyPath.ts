import type { StringArray } from './StringArray';

export type KeyPath = string | KeyPathJSON;

export type Path = string | StringArray;

export interface KeyPathJSON {
  key: string;

  path?: Path;
}
