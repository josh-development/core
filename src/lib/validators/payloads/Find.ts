import { FindByHookPayload, FindByValuePayload, FindPayload, Payload } from '../../payloads';
import { Method } from '../../types';

/**
 * Validates whether the given payload is {@link FindByHookPayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isFindByHookPayload<DataValue>(payload: FindPayload<DataValue>): payload is FindByHookPayload<DataValue> {
  return payload.method === Method.Find && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link FindByValuePayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isFindByValuePayload<DataValue>(payload: FindPayload<DataValue>): payload is FindByValuePayload<DataValue> {
  return payload.method === Method.Find && payload.type === Payload.Type.Value;
}
