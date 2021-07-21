import type { Stopwatch } from '@sapphire/stopwatch';
import type { Method, Trigger } from '../../types';

export interface Payload {
	method: Method;
	trigger?: Trigger;
	stopwatch?: Stopwatch;
}
