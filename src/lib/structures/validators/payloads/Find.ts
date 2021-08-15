import { Method } from '../../../types';
import { FindByDataPayload, FindByHookPayload, FindPayload, Payload } from '../../payloads';

export function isFindByDataPayload<Value = unknown>(payload: FindPayload<Value>): payload is FindByDataPayload<Value> {
	return payload.type === Payload.Type.Data && payload.method === Method.Find;
}

export function isFindByHookPayload<Value = unknown>(payload: FindPayload<Value>): payload is FindByHookPayload<Value> {
	return payload.type === Payload.Type.Hook && payload.method === Method.Find;
}
