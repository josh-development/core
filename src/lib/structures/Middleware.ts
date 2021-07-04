import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import { Method } from '../types/Method';
import { JoshError } from './JoshError';

export class Middleware extends Piece {
	public readonly method: Method;

	public constructor(context: PieceContext, options: MiddlewareOptions = {}) {
		super(context, options);

		if (!options.method && !Object.values(Method).find((method) => method === this.name))
			throw new JoshError('An invalid method was provided.', 'JoshMiddlewareError');

		this.method = options.method ?? (this.name as Method);
	}
}

export interface MiddlewareOptions extends PieceOptions {
	method?: Method;
}
