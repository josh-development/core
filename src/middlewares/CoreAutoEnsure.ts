import { ApplyOptions } from '../lib/decorators/ApplyOptions';
import type {
	DecPayload,
	GetManyPayload,
	GetPayload,
	IncPayload,
	MathPayload,
	PushPayload,
	RemoveByHookPayload,
	RemoveByValuePayload,
	RemovePayload,
	SetManyPayload,
	SetPayload,
	UpdatePayload
} from '../lib/payloads';
import { Middleware } from '../lib/structures/Middleware';
import { BuiltInMiddleware, Method, Trigger } from '../lib/types';

@ApplyOptions<Middleware.Options>({
	name: BuiltInMiddleware.AutoEnsure,
	position: 0,
	conditions: [
		{
			methods: [Method.Dec, Method.Inc, Method.Push, Method.Remove, Method.Set, Method.SetMany],
			trigger: Trigger.PreProvider
		},
		{
			methods: [Method.Get, Method.GetMany, Method.Update],
			trigger: Trigger.PostProvider
		}
	],
	use: false
})
export class CoreMiddleware extends Middleware<AutoEnsureContext> {
	public async [Method.Dec](payload: DecPayload): Promise<DecPayload> {
		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;

		await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}

	public async [Method.Get]<Value>(payload: GetPayload<Value>): Promise<GetPayload<Value>> {
		if (payload.data !== undefined) return payload;

		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;
		const { data } = await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		Reflect.set(payload, 'data', data);

		return payload;
	}

	public async [Method.GetMany]<Value>(payload: GetManyPayload<Value>): Promise<GetManyPayload<Value>> {
		if (Object.keys(payload.data).length !== 0) return payload;

		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;

		for (const [key] of payload.keys) {
			if (payload.data[key] !== null) continue;

			const { data } = await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

			Reflect.set(payload, 'data', data);
		}

		return payload;
	}

	public async [Method.Inc](payload: IncPayload): Promise<IncPayload> {
		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;

		await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}

	public async [Method.Push]<Value>(payload: PushPayload<Value>): Promise<PushPayload<Value>> {
		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;

		await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}

	public async [Method.Math](payload: MathPayload): Promise<MathPayload> {
		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;

		await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}

	public async [Method.Remove]<HookValue>(payload: RemoveByHookPayload<HookValue>): Promise<RemoveByHookPayload<HookValue>>;
	public async [Method.Remove](payload: RemoveByValuePayload): Promise<RemoveByValuePayload>;
	public async [Method.Remove]<HookValue>(payload: RemovePayload<HookValue>): Promise<RemovePayload<HookValue>> {
		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;

		await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}

	public async [Method.Set]<Value>(payload: SetPayload<Value>): Promise<SetPayload<Value>> {
		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;

		await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}

	public async [Method.SetMany]<Value>(payload: SetManyPayload<Value>): Promise<SetManyPayload<Value>> {
		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;

		for (const key of payload.keys) await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}

	public async [Method.Update]<StoredValue, Value, HookValue>(
		payload: UpdatePayload<StoredValue, Value, HookValue>
	): Promise<UpdatePayload<StoredValue, Value, HookValue>> {
		const context = this.getContext();

		if (!context) return payload;

		const { defaultValue } = context;
		const { key } = payload;

		await this.provider.ensure({ method: Method.Ensure, key, data: defaultValue, defaultValue });

		return payload;
	}
}

export interface AutoEnsureContext<Value = unknown> extends Middleware.Context {
	defaultValue: Value;
}
