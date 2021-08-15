import { Method } from '../../../types';
import { Payload, UpdateByDataPayload, UpdateByHookPayload, UpdatePayload } from '../../payloads';

export function isUpdateByDataPayload<Value = unknown>(payload: UpdatePayload<Value>): payload is UpdateByDataPayload<Value> {
	return payload.type === Payload.Type.Data && payload.method === Method.Update;
}

export function isUpdateByHookPayload<Value = unknown>(payload: UpdatePayload<Value>): payload is UpdateByHookPayload<Value> {
	return payload.type === Payload.Type.Hook && payload.method === Method.Update;
}
