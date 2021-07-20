import { ApplyOptions } from '../structures/decorators/ApplyOptions';
import { Middleware, MiddlewareOptions } from '../structures/Middleware';
import type { GetPayload, SetPayload } from '../structures/payloads';
import { Method, Trigger } from '../types';

@ApplyOptions<MiddlewareOptions>({
	name: 'autoEnsure',
	position: 0,
	conditions: [{ methods: [Method.Get] }, { methods: [Method.Set], trigger: Trigger.PreProvider }]
})
export class CoreAutoEnsure extends Middleware {
	public [Method.Get]<V = unknown>(payload: GetPayload<V>): GetPayload<V> {
		return payload;
	}

	public [Method.Set](payload: SetPayload) {
		return payload;
	}
}
