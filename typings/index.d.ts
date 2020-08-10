declare enum JoshProviders {
  sqlite = "@josh-providers/sqlite",
}

declare module "josh" {
  export interface JoshOptions<T = unknown> {
    name: string;
    provider: "@josh-providers/sqlite";
    ensureProps?: boolean;
    autoEnsure?: T;
    serializer?: (data: T) => Promise<T>;
    deserializer?: (data: T) => Promise<T>;
  }

  export default class Josh<T> {
    public constructor(options: JoshOptions<T>);

    public get keys(): Promise<string[]>;

    public get values(): Promise<T[]>;

    public get size(): Promise<number>;

    public get(keyOrPath: string): Promise<T>;

    public getMany(keysOrPaths: string[]): Promise<T[][]>;

    public random(count: number): Promise<T[][]>;

    public randomKey(count: number): Promise<string[][]>;

    public has(keyOrPath: string): Promise<boolean>;

    public set(keyOrPath: string, value: any): Promise<Josh<T>>;

    public update(
      keyOrPath: string,
      input: T | ((previousValue: T) => T)
    ): Promise<T>;

    public ensure(keyOrPath: string, defaultValue: T): Promise<T>;

    public delete(keyOrPath: string): Promise<Josh<T>>;

    public push(
      keyOrPath: string,
      value: T,
      allowDupes: boolean
    ): Promise<Josh<T>>;

    public remove(
      keyOrPath: string,
      value: T | ((value: T) => boolean)
    ): Promise<Josh<T>>;

    public inc(keyOrPath: string): Promise<Josh<T>>;

    public dec(keyOrPath: string): Promise<Josh<T>>;
  }
}
