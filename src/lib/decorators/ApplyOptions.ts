import type { Piece, PieceOptions } from '@sapphire/pieces';
import type { Ctor } from '@sapphire/utilities';
import { createClassDecorator } from './utils/createClassDecorator';
import { createProxy } from './utils/createProxy';

export function ApplyOptions<T extends PieceOptions>(options: T): ClassDecorator {
	return createClassDecorator((target: Ctor<ConstructorParameters<typeof Piece>, Piece>) =>
		createProxy(target, {
			construct: (ctor, [context, baseOptions = {}]) =>
				new ctor(context, {
					...baseOptions,
					...options
				})
		})
	);
}
