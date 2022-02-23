export type KeyPath = string | KeyPathJSON;

export type Path = string | string[];

export interface KeyPathJSON {
  key: string;

  path?: Path;
}
