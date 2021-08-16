import { Payload, SomeByDataPayload, SomeByHookPayload, SomePayload } from '../../payloads';
import { Method } from '../../types';

export function isSomeByDataPayload<Value = unknown>(payload: SomePayload<Value>): payload is SomeByDataPayload<Value> {
	return payload.type === Payload.Type.Data && payload.method === Method.Some;
}

export function isSomeByHookPayload<Value = unknown>(payload: SomePayload<Value>): payload is SomeByHookPayload<Value> {
	return payload.type === Payload.Type.Hook && payload.method === Method.Some;
}
