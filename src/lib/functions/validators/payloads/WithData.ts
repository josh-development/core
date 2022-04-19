import type { Payload } from '../../../types';

export function isPayloadWithData<Value>(payload: Payload): payload is Payload.WithData<Value> {
  return 'data' in payload;
}
