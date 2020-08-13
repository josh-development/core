declare module "josh" {
  export interface JoshOptions<T = unknown> {
    name: string;
    provider: string;
    ensureProps?: boolean;
    autoEnsure?: T;
    serializer?: (data: T) => Promise<T>;
    deserializer?: (data: T) => Promise<T>;
  }

  export default class Josh<T = unknown> {
    public constructor(options: JoshOptions<T>);

    public all: symbol;

    public get keys(): Promise<string[]>;

    public get values(): Promise<T[]>;

    public get size(): Promise<number>;

    public get(keyOrPath: string): Promise<T>;

    public getMany(keysOrPaths: string[] | symbol): Promise<T[][]>;

    public random(count: number): Promise<T[][]>;

    public randomKey(count: number): Promise<string[][]>;

    public has(keyOrPath: string): Promise<boolean>;

    public set(keyOrPath: string, value: any): Promise<Josh<T>>;

    public update(
      keyOrPath: string,
      input: T | ((previousValue: T) => T)
    ): Promise<T>;

    public ensure(keyOrPath: string, defaultValue: T): Promise<T>;

    public delete(keyOrPath: string | symbol): Promise<Josh<T>>;

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

    public find(
      valueOrFn: string | ((value: T) => boolean),
      path?: string
    ): Promise<[string, T]>;

    public filter(
      valueOrFn: string | ((value: T) => boolean),
      path?: string
    ): Promise<[string, T][]>;
  }
}
