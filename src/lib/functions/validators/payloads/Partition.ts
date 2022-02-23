import { Method, Payload, Payloads } from '../../../types';

/**
 * Validates whether the given payload is {@link Payloads.Partition.ByHook}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isPartitionByHookPayload<StoredValue>(payload: Payloads.Partition<StoredValue>): payload is Payloads.Partition.ByHook<StoredValue> {
  return payload.method === Method.Partition && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link Payloads.Partition.ByValue}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isPartitionByValuePayload<StoredValue>(payload: Payloads.Partition<StoredValue>): payload is Payloads.Partition.ByValue<StoredValue> {
  return payload.method === Method.Partition && payload.type === Payload.Type.Value;
}
