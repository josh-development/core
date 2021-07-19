import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import { Condition, Method, Trigger } from '../types';
import { JoshError } from './JoshError';
import type { Payload } from './payloads';

export abstract class Middleware extends Piece {
	public readonly position?: number;

	public readonly conditions: Condition[];

	public [Method.Get]?: MiddlewareHook;

	public [Method.GetAll]?: MiddlewareHook;

	public [Method.Set]?: MiddlewareHook;

	public constructor(context: PieceContext, options: MiddlewareOptions = {}) {
		super(context, options);

		const { position, conditions } = options;

		if (!conditions) throw new JoshError('Missing condition option.', 'JoshMiddlewareError');

		for (const condition of conditions) {
			condition.methods ??= [];
			condition.trigger ??= Trigger.PostProvider;
		}

		this.position = position;
		this.conditions = conditions;
	}

	public [Method.All]<P extends Payload>(payload: P): Awaited<P> {
		return payload;
	}
}

export interface MiddlewareOptions extends PieceOptions {
	position?: number;

	conditions?: Condition[];
}

export type MiddlewareHook = <P extends Payload>(payload: P) => Awaited<P>;
