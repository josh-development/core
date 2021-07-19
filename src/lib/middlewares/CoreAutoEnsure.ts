import { ApplyOptions } from '../structures/decorators/ApplyOptions';
import { Middleware, MiddlewareOptions } from '../structures/Middleware';
import { Method, Trigger } from '../types';

@ApplyOptions<MiddlewareOptions>({
	name: 'autoEnsure',
	position: 0,
	conditions: [{ methods: [Method.Get] }, { methods: [Method.Set], trigger: Trigger.PreProvider }]
})
export class CoreAutoEnsure extends Middleware {}
