declare module "@joshdb/core" {
  export interface JoshOptions<T = unknown> {
    name: string;
    provider: unknown,
    ensureProps?: boolean;
    autoEnsure?: T;
    serializer?: (data: T) => Promise<T>;
    deserializer?: (data: T) => Promise<T>;
    providerOptions?: object;
  }

  export default class Josh<T = unknown> {
    public constructor(options: JoshOptions<T>);

    public all: symbol;

    public get keys(): Promise<string[]>;

    public get values(): Promise<T[]>;

    public get size(): Promise<number>;

    public get<K extends unknown = T>(keyOrPath: string): Promise<K>;

    public getMany<K extends unknown = T>(
      keyOrPaths: string[]
    ): Promise<K[]>;

    public random(count: number): Promise<[string, T][]>;

    public randomKey(count: number): Promise<string[]>;

    public has(keyOrPath: string): Promise<boolean>;

    public set<K extends unknown = T>(
      keyOrPath: string,
      value: K
    ): Promise<Josh<T>>;

    public setMany(data: [string, T][], overwrite?: boolean): Promise<Josh<T>>;

    public update<K extends Partial<unknown> = Partial<T>>(
      keyOrPath: string,
      input: K
    ): Promise<K>;

    public ensure(keyOrPath: string, defaultValue: T): Promise<T>;

    public delete(keyOrPath: string | symbol): Promise<Josh<T>>;

    public push<K extends unknown = T>(
      keyOrPath: string,
      value: K,
      allowDupes: boolean
    ): Promise<Josh<T>>;

    public remove<K extends unknown = T>(
      keyOrPath: string,
      value: K
    ): Promise<Josh<T>>;

    public inc(keyOrPath: string): Promise<Josh<T>>;

    public dec(keyOrPath: string): Promise<Josh<T>>;

    public find<K extends unknown = T>(
      pathOrFn: string | ((value: K) => Promise<boolean> | boolean),
      predicate?: string
    ): Promise<T>;

    public filter<K extends unknown = T>(
      pathOrFn: string | ((value: K) => Promise<boolean> | boolean),
      predicate?: string
    ): Promise<[string, T][]>;

    public map<K extends unknown = T>(
      pathOrFn: string | ((value: T) => Promise<K> | K)
    ): Promise<K[]>;

    public includes<K extends unknown = T>(
      keyOrPath: string,
      value: K
    ): Promise<boolean>;

    public some(
      keyOrPath: string,
      value: string | number | boolean | null
    ): Promise<boolean>;

    public every(
      pathOrFn: string,
      value: string | number | boolean | null
    ): Promise<boolean>;

    public math(
      keyOrPath: string,
      operation: string,
      operand: number,
      path?: string
    ): Promise<Josh<T>>;

    public get autoId(): Promise<string>;

    public import(
      data: string,
      overwrite?: boolean,
      clear?: boolean
    ): Promise<Josh<T>>;

    public export(): Promise<string>;
    
    static multi(names: string[], options: Omit<JoshOptions, "name">): Josh[];
  }
}
