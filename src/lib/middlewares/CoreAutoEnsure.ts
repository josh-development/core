import { ApplyOptions } from '../structures/decorators/ApplyOptions';
import { Middleware, MiddlewareContext, MiddlewareOptions } from '../structures/Middleware';
import type { GetPayload, SetPayload } from '../structures/payloads';
import { Method, Trigger } from '../types';
import { BuiltInMiddleware } from '../types/BuiltInMiddleware';

@ApplyOptions<MiddlewareOptions>({
	name: BuiltInMiddleware.AutoEnsure,
	position: 0,
	conditions: [
		{
			methods: [Method.Get],
			trigger: Trigger.PostProvider
		},
		{
			methods: [Method.Set],
			trigger: Trigger.PreProvider
		}
	],
	use: false
})
export class CoreAutoEnsure extends Middleware {
	public async [Method.Get]<V = unknown>(payload: GetPayload<V>): Promise<GetPayload<V>> {
		const context = this.getContext<AutoEnsureContext>();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;
		const { data } = await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		Reflect.set(payload, 'data', data);

		return payload;
	}

	public async [Method.Set](payload: SetPayload) {
		const context = this.getContext<AutoEnsureContext>();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;

		await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}
}

export interface AutoEnsureContext<T = unknown> extends MiddlewareContext {
	defaultValue: T;
}
