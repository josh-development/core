import { ApplyOptions } from '../structures/decorators/ApplyOptions';
import { Middleware, MiddlewareOptions } from '../structures/Middleware';
import type { GetPayload, SetPayload } from '../structures/payloads';
import { Method, Trigger } from '../types';
import { BuiltInMiddleware } from '../types/BuiltInMiddleware';

@ApplyOptions<MiddlewareOptions>({
	name: BuiltInMiddleware.AutoEnsure,
	position: 0,
	conditions: [{ methods: [Method.Get] }, { methods: [Method.Set], trigger: Trigger.PreProvider }],
	use: false
})
export class CoreAutoEnsure extends Middleware {
	public async [Method.Get]<V = unknown>(payload: GetPayload<V>): Promise<GetPayload<V>> {
		const defaultValue = this.store.instance.options.middlewareOptions?.[BuiltInMiddleware.AutoEnsure]?.defaultValue;

		const { key } = payload;

		const { data } = await this.store.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		payload.data = data as V;

		return payload;
	}

	public async [Method.Set](payload: SetPayload) {
		const defaultValue = this.store.instance.options.middlewareOptions?.[BuiltInMiddleware.AutoEnsure]?.defaultValue;

		const { key } = payload;

		await this.store.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}
}

export interface AutoEnsureDataOptions<T = unknown> {
	defaultValue: T;
}
