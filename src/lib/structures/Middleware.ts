import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import { Method } from '../types/Method';
import { JoshError } from './JoshError';
import type { Payload } from './payloads/Payload';

export abstract class Middleware extends Piece {
	public readonly method: Method;

	public readonly position?: number;

	public constructor(context: PieceContext, options: MiddlewareOptions = {}) {
		super(context, options);

		const { method, position } = options;

		if (!method) throw new JoshError('No method was provided.', 'JoshMiddlewareError');
		if (!Object.values(Method).find((m) => m === method)) throw new JoshError('An invalid method was provided.', 'JoshMiddlewareError');

		this.method = method;
		this.position = position;
	}

	public abstract run<P extends Payload>(payload: P): Awaited<P>;
}

export interface MiddlewareOptions extends PieceOptions {
	method?: Method;

	position?: number;
}
