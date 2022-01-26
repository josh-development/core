import { MapByHookPayload, MapByPathPayload, MapPayload, Payload } from '../../payloads';
import { Method } from '../../types';

/**
 * Validates whether the given payload is {@link MapByHookPayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isMapByHookPayload<DataValue, HookValue>(
  payload: MapPayload<DataValue, HookValue>
): payload is MapByHookPayload<DataValue, HookValue> {
  return payload.method === Method.Map && payload.type === Payload.Type.Hook;
}

/**
 * Validates whether the given payload is {@link MapByValuePayload}
 * @since 2.0.0
 * @param payload The payload to validate.
 * @returns Validation boolean.
 */
export function isMapByPathPayload<DataValue, HookValue>(payload: MapPayload<DataValue, HookValue>): payload is MapByPathPayload<DataValue> {
  return payload.method === Method.Map && payload.type === Payload.Type.Path;
}
