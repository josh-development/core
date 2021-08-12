import { FindByDataPayload, FindByHookPayload, FindPayload, Payload } from '../../payloads';

export function isFindByDataPayload<Value = unknown>(payload: FindPayload<Value>): payload is FindByDataPayload<Value> {
	return payload.type === Payload.Type.Data;
}

export function isFindByHookPayload<Value = unknown>(payload: FindPayload<Value>): payload is FindByHookPayload<Value> {
	return payload.type === Payload.Type.Hook;
}
