import { ApplyOptions } from '../structures/decorators/ApplyOptions';
import { Middleware, MiddlewareOptions } from '../structures/Middleware';
import type { GetPayload, SetPayload } from '../structures/payloads';
import { Method, Trigger } from '../types';
import { Middlewares } from '../types/Middlewares';

@ApplyOptions<MiddlewareOptions>({
	name: Middlewares.AutoEnsure,
	position: 0,
	conditions: [{ methods: [Method.Get] }, { methods: [Method.Set], trigger: Trigger.PreProvider }],
	use: false
})
export class CoreAutoEnsure extends Middleware {
	public async [Method.Get]<V = unknown>(payload: GetPayload<V>): Promise<GetPayload<V>> {
		const defaultData = this.store.instance.options.middlewareOptions?.[Middlewares.AutoEnsure]?.defaultData;

		const { key } = payload;

		if ((await this.store.provider.has({ method: Method.Has, key, path: '', data: false })).data) return payload;

		await this.store.provider.set({ method: Method.Has, key, path: '' }, defaultData);

		payload.data = defaultData as any;

		return payload;
	}

	public async [Method.Set](payload: SetPayload) {
		const defaultData = this.store.instance.options.middlewareOptions?.[Middlewares.AutoEnsure]?.defaultData;

		const { key } = payload;

		if ((await this.store.provider.has({ method: Method.Has, key, path: '', data: false })).data) return payload;

		await this.store.provider.set({ method: Method.Has, key, path: '' }, defaultData);

		return payload;
	}
}

export interface AutoEnsureDataOptions<T = unknown> {
	defaultData: T;
}
