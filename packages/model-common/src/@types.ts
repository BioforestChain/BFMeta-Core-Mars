declare namespace BFChainCore {
  interface FractionJSON<T extends number | bigint | string = number> {
    /**分子 */
    numerator: T;
    /**分母 */
    denominator: T;
  }
  interface RangeJSON {
    start: number;
    end: number;
  }
  interface RateJSON<T extends number | bigint | string = number> {
    /**前部权重 */
    prevWeight: T;
    /**后部权重 */
    nextWeight: T;
  }
}
