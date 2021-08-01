import type { KeyPath } from '../../types';
import type { Payload } from './Payload';

export interface SetPayload extends Payload, KeyPath {}
