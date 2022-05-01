import type { Primitive } from '@sapphire/utilities';
import type { MathOperator, Method } from '.';
import type { Payload } from './Payload';

export namespace Payloads {
  /**
   * The payload for {@link Method.Dec}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface AutoKey extends Payload, Payload.Data<string> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.AutoKey;
  }

  /**
   * The payload for {@link Method.Clear}
   * @since 2.0.0
   * @see {@link Payload}
   */
  export interface Clear extends Payload {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Clear;
  }

  /**
   * The payload for {@link Method.Dec}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.KeyPath}
   */
  export interface Dec extends Payload, Payload.KeyPath {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Dec;
  }

  /**
   * The payload for {@link Method.Delete}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.KeyPath}
   */
  export interface Delete extends Payload, Payload.KeyPath {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Delete;
  }

  /**
   * The payload for {@link Method.Get}
   * @since 2.0.0
   * @see {@link Payload}
   */
  export interface DeleteMany extends Payload {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.DeleteMany;

    /**
     * The keys to delete.
     * @since 2.0.0
     */
    keys: string[];
  }

  /**
   * The payload for {@link Method.Each}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Each<StoredValue> extends Payload {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Each;

    hook: Payload.HookWithKey<StoredValue>;
  }

  /**
   * The payload for {@link Method.Get}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Ensure<StoredValue> extends Payload, Payload.Data<StoredValue> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Ensure;

    /**
     * The key to get or set.
     * @since 2.0.0
     */
    key: string;

    /**
     * The default value to store if {@link Payloads.Ensure.key} doesn't exist.
     * @since 2.0.0
     */
    defaultValue: StoredValue;
  }

  /**
   * The payload for {@link Method.Get}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */

  /**
   * The payload for {@link Method.Entries}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Entries<StoredValue> extends Payload, Payload.Data<Record<string, StoredValue>> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
  }
  export interface Every<StoredValue> extends Payload, Payload.Data<boolean> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Every;

    /**
     * The type for this payload.
     * @since 2.0.0
     */
    type: Payload.Type.Hook | Payload.Type.Value;

    /**
     * The hook to check equality.
     * @since 2.0.0
     */
    hook?: Payload.Hook<StoredValue>;

    /**
     * The value to check equality.
     * @since 2.0.0
     */
    value?: Primitive;

    /**
     * A path to the value for equality check.
     * @since 2.0.0
     */
    path?: string[];
  }

  export namespace Every {
    /**
     * The hook payload for {@link Method.Every}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByHook}
     * @see {@link Payload.Data}
     */
    export interface ByHook<StoredValue> extends Payload, Payload.ByHook<Payload.Hook<StoredValue>>, Payload.Data<boolean> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Every;
    }

    /**
     * The value payload for {@link Method.Every}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByValue}
     * @see {@link Payload.Data}
     */
    export interface ByValue extends Payload, Payload.ByValueWithPath<Primitive>, Payload.Data<boolean> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Every;
    }
  }

  /**
   * The payload for {@link Method.Filter}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Filter<StoredValue> extends Payload, Payload.Data<Record<string, StoredValue>> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Filter;

    /**
     * The type for this payload.
     * @since 2.0.0
     */
    type: Payload.Type.Hook | Payload.Type.Value;

    /**
     * The hook to check equality.
     * @since 2.0.0
     */
    hook?: Payload.Hook<StoredValue>;

    /**
     * The value to check equality.
     * @since 2.0.0
     */
    value?: Primitive;

    /**
     * A path to the value for equality check.
     * @since 2.0.0
     */
    path?: string[];
  }

  export namespace Filter {
    /**
     * The hook payload for {@link Method.Filter}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByHook}
     * @see {@link Payload.Data}
     */
    export interface ByHook<StoredValue> extends Payload, Payload.ByHook<Payload.Hook<StoredValue>>, Payload.Data<Record<string, StoredValue>> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Filter;
    }

    /**
     * The value payload for {@link Method.Filter}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByValue}
     * @see {@link Payload.Data}
     */
    export interface ByValue<StoredValue> extends Payload, Payload.ByValueWithPath<Primitive>, Payload.Data<Record<string, StoredValue>> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Filter;
    }
  }

  /**
   * The payload for {@link Method.Find}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Find<StoredValue> extends Payload, Payload.Data<[string, StoredValue] | [null, null]> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Find;

    /**
     * The type for this payload.
     * @since 2.0.0
     */
    type: Payload.Type.Hook | Payload.Type.Value;

    /**
     * The hook to check equality.
     * @since 2.0.0
     */
    hook?: Payload.Hook<StoredValue>;

    /**
     * The value to check equality.
     * @since 2.0.0
     */
    value?: Primitive;

    /**
     * A path to the value for equality check.
     * @since 2.0.0
     */
    path?: string[];
  }

  export namespace Find {
    /**
     * The hook payload for {@link Method.Find}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByHook}
     * @see {@link Payload.Data}
     */
    export interface ByHook<StoredValue>
      extends Payload,
        Payload.ByHook<Payload.Hook<StoredValue>>,
        Payload.Data<[string, StoredValue] | [null, null]> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Find;
    }

    /**
     * The value payload for {@link Method.Find}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByValue}
     * @see {@link Payload.Data}
     */
    export interface ByValue<StoredValue> extends Payload, Payload.ByValueWithPath<Primitive>, Payload.Data<[string, StoredValue] | [null, null]> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Find;
    }
  }

  /**
   * The payload for {@link Method.Get}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.KeyPath}
   * @see {@link Payload.Data}
   */
  export interface Get<StoredValue> extends Payload, Payload.KeyPath, Payload.Data<StoredValue> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Get;
  }

  /**
   * The payload for {@link Method.GetMany}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface GetMany<StoredValue> extends Payload, Payload.Data<Record<string, StoredValue | null>> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.GetMany;

    /**
     * The keys for this payload.
     * @since 2.0.0
     */
    keys: string[];
  }

  /**
   * The payload for {@link Method.Has}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.KeyPath}
   * @see {@link Payload.Data}
   */
  export interface Has extends Payload, Payload.KeyPath, Payload.Data<boolean> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Has;
  }

  /**
   * The payload for {@link Method.Inc}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.KeyPath}
   */
  export interface Inc extends Payload, Payload.KeyPath {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Inc;
  }

  /**
   * The payload for {@link Method.Keys}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Keys extends Payload, Payload.Data<string[]> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Keys;
  }

  /**
   * The payload for {@link Method.Map}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Map<Value, ReturnValue> extends Payload, Payload.Data<ReturnValue[]> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Map;

    /**
     * The type for this payload.
     * @since 2.0.0
     */
    type: Payload.Type.Hook | Payload.Type.Path;

    /**
     * The hook to map stored values by.
     * @since 2.0.0
     */
    hook?: Payload.Hook<Value, ReturnValue>;

    /**
     * The path to map stored values by.
     * @since 2.0.0
     */
    path?: string[];
  }

  export namespace Map {
    /**
     * The hook payload for {@link Method.Map}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByHook}
     * @see {@link Payload.Data}
     */
    export interface ByHook<Value, ReturnValue> extends Payload, Payload.ByHook<Payload.Hook<Value, ReturnValue>>, Payload.Data<ReturnValue[]> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Map;

      /**
       * The type for this payload.
       * @since 2.0.0
       */
      type: Payload.Type.Hook;
    }

    /**
     * The path payload for {@link Method.Map}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByPath}
     * @see {@link Payload.Data}
     */
    export interface ByPath<ReturnValue> extends Payload, Payload.ByPath, Payload.Data<ReturnValue[]> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Map;

      /**
       * The type for this payload.
       * @since 2.0.0
       */
      type: Payload.Type.Path;

      /**
       * The path to map stored values by.
       * @since 2.0.0
       */
      path: string[];
    }
  }

  /**
   * The payload for {@link Method.Math}
   * @since 2.0.0
   */
  export interface Math extends Payload, Payload.KeyPath {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Math;

    /**
     * The operator to apply to the operand.
     * @since 2.0.0
     */
    operator: MathOperator;

    /**
     * The operand to apply the operator to.
     * @since 2.0.0
     */
    operand: number;
  }

  /**
   * The payload for {@link Method.Partition}
   * @since 2.0.0
   */
  export interface Partition<StoredValue> extends Payload, Payload.Data<Partition.Data<StoredValue>> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Partition;

    /**
     * The type for this payload.
     * @since 2.0.0
     */
    type: Payload.Type.Hook | Payload.Type.Value;

    /**
     * The hook to partition stored values by.
     * @since 2.0.0
     */
    hook?: Payload.Hook<StoredValue>;

    /**
     * The value to partition stored values by.
     * @since 2.0.0
     */
    value?: Primitive;

    /**
     * The path to partition stored values by.
     * @since 2.0.0
     */
    path?: string[];
  }

  export namespace Partition {
    /**
     * The hook payload for {@link Method.Partition}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByHook}
     * @see {@link Payload.Data}
     */
    export interface ByHook<StoredValue> extends Payload, Payload.ByHook<Payload.Hook<StoredValue>>, Payload.Data<Data<StoredValue>> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Partition;
    }

    /**
     * The value payload for {@link Method.Partition}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByValue}
     * @see {@link Payload.Data}
     */
    export interface ByValue<StoredValue> extends Payload, Payload.ByValueWithPath<Primitive>, Payload.Data<Data<StoredValue>> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Partition;
    }

    /**
     * The data for {@link Method.Partition}
     * @since 2.0.0
     */
    export interface Data<StoredValue> {
      /**
       * The truthy entries.
       * @since 2.0.0
       */
      truthy: Record<string, StoredValue>;

      /**
       * The falsy entries.
       * @since 2.0.0
       */
      falsy: Record<string, StoredValue>;
    }
  }

  /**
   * The payload for {@link Method.Push}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.KeyPath}
   */
  export interface Push<Value> extends Payload, Payload.KeyPath {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Push;

    /**
     * The value to push to an array.
     * @since 2.0.0
     */
    value: Value;
  }

  /**
   * The payload for {@link Method.Random}
   * @since 2.0.0
   */
  export interface Random<StoredValue> extends Payload, Payload.Data<StoredValue[]> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Random;

    /**
     * The amount of random values to get.
     * @since 2.0.0
     */
    count: number;

    /**
     * Whether to allow duplicate values.
     * @since 2.0.0
     */
    duplicates: boolean;
  }

  /**
   * The payload for {@link Method.RandomKey}
   * @since 2.0.0
   */
  export interface RandomKey extends Payload, Payload.Data<string[]> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.RandomKey;

    /**
     * The amount of random keys to get.
     * @since 2.0.0
     */
    count: number;

    /**
     * Whether to allow duplicate keys.
     * @since 2.0.0
     */
    duplicates: boolean;
  }

  /**
   * The payload for {@link Method.Remove}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.KeyPath}
   */
  export interface Remove<Value> extends Payload, Payload.KeyPath {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Remove;

    /**
     * The type for this payload.
     * @since 2.0.0
     */
    type: Payload.Type.Hook | Payload.Type.Value;

    /**
     * The hook to equality.
     * @since 2.0.0
     */
    hook?: Payload.Hook<Value, boolean>;

    /**
     * The value to check equality.
     * @since 2.0.0
     */
    value?: Primitive;
  }

  export namespace Remove {
    /**
     * The hook payload for {@link Method.Remove}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.KeyPath}
     * @see {@link Payload.ByHook}
     */
    export interface ByHook<Value> extends Payload, Payload.KeyPath, Payload.ByHook<Payload.Hook<Value, boolean>> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Remove;

      /**
       * The type for this payload.
       * @since 2.0.0
       */
      type: Payload.Type.Hook;
    }

    /**
     * The value payload for {@link Method.Remove}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByValue}
     */
    export interface ByValue extends Payload, Payload.KeyPath, Payload.ByValue<Primitive> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Remove;

      /**
       * The type for this payload.
       * @since 2.0.0
       */
      type: Payload.Type.Value;
    }
  }

  /**
   * The payload for {@link Method.Set}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.KeyPath}
   */
  export interface Set<Value> extends Payload, Payload.KeyPath {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Set;

    /**
     * The value to set.
     * @since 2.0.0
     */
    value: Value;
  }

  /**
   * The payload for {@link Method.SetMany}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface SetMany extends Payload {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.SetMany;

    /**
     * Whether to overwrite existing entries.
     * @since 2.0.0
     */
    overwrite: boolean;

    /**
     * The entries to set.
     * @since 2.0.0
     */
    entries: [Payload.KeyPath, unknown][];
  }

  /**
   * The payload for {@link Method.Size}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Size extends Payload, Payload.Data<number> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Size;
  }

  /**
   * The payload for {@link Method.Some}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Some<StoredValue> extends Payload, Payload.Data<boolean> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Some;

    /**
     * The type for this payload.
     * @since 2.0.0
     */
    type: Payload.Type.Hook | Payload.Type.Value;

    /**
     * The hook to check equality.
     * @since 2.0.0
     */
    hook?: Payload.Hook<StoredValue>;

    /**
     * The value to check equality.
     * @since 2.0.0
     */
    value?: Primitive;

    /**
     * The path to the value to check equality.
     * @since 2.0.0
     */
    path?: string[];
  }

  export namespace Some {
    /**
     * The hook payload for {@link Method.Some}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByHook}
     * @see {@link Payload.Data}
     */
    export interface ByHook<Value> extends Payload, Payload.ByHook<Payload.Hook<Value, boolean>>, Payload.Data<boolean> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Some;
    }

    /**
     * The value payload for {@link Method.Some}
     * @since 2.0.0
     * @see {@link Payload}
     * @see {@link Payload.ByValue}
     * @see {@link Payload.Data}
     */
    export interface ByValue extends Payload, Payload.ByValueWithPath<Primitive>, Payload.Data<boolean> {
      /**
       * The method this payload is for.
       * @since 2.0.0
       */
      method: Method.Some;
    }
  }

  /**
   * The payload for {@link Method.Update}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.KeyPath}
   * @see {@link Payload.Data}
   */
  export interface Update<Value, ReturnValue> extends Payload {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Update;

    /**
     * The key to the value to update.
     * @since 2.0.0
     */
    key: string;

    /**
     * The hook to update stored value.
     * @since 2.0.0
     */
    hook: Payload.Hook<Value, ReturnValue>;
  }

  /**
   * The payload for {@link Method.Values}
   * @since 2.0.0
   * @see {@link Payload}
   * @see {@link Payload.Data}
   */
  export interface Values<StoredValue> extends Payload, Payload.Data<StoredValue[]> {
    /**
     * The method this payload is for.
     * @since 2.0.0
     */
    method: Method.Values;
  }
}
