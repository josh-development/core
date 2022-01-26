import type { MathOperator, Method } from '../types';
import type { Payload } from './Payload';

/**
 * The payload for {@link Method.Math}
 * @see {@link Payload}
 * @see {@link Payload.KeyPath}
 * @since 2.0.0
 */
export interface MathPayload extends Payload, Payload.KeyPath {
  /**
   * The method this payload is for.
   * @since 2.0.0
   */
  method: Method.Math;

  /**
   * The operator to apply to the operands.
   * @since 2.0.0
   */
  operator: MathOperator;

  /**
   * The operand to apply to the operator.
   * @since 2.0.0
   */
  operand: number;
}
