import type { Method } from './Method';
import type { Trigger } from './Trigger';

export interface Condition {
	methods: Method[];

	trigger: Trigger;
}
