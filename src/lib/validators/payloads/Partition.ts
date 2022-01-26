import { PartitionByHookPayload, PartitionByValuePayload, PartitionPayload, Payload } from '../../payloads';
import { Method } from '../../types';

/**
 * Validates whether the given payload is {@link PartitionByHookPayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isPartitionByHookPayload<DataValue>(payload: PartitionPayload<DataValue>): payload is PartitionByHookPayload<DataValue> {
  return payload.method === Method.Partition && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link PartitionByValuePayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isPartitionByValuePayload<DataValue>(payload: PartitionPayload<DataValue>): payload is PartitionByValuePayload<DataValue> {
  return payload.method === Method.Partition && payload.type === Payload.Type.Value;
}
