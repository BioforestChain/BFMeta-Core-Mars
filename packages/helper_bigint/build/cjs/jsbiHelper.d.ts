declare type BI = bigint | number | string;
export declare class JSBIHelper {
    /**
     * 向下取整
     *
     * @param z
     */
    multiplyFloor(x: BI, y: number): bigint;
    /**
     * 与分数相乘，向下取整
     *
     * @param z
     */
    multiplyFloorFraction(x: BI, y: BFChainCore.FractionJSON<string | number | bigint>): bigint;
    multiplyFloorFractionString(x: BI, y: {
        numerator: BI;
        denominator: BI;
    }): bigint;
    /**
     * 四舍五入
     *
     * @param z
     */
    multiplyRound(x: BI, y: number): bigint;
    /**
     * 与分数相乘，四舍五入
     *
     * @param z
     */
    multiplyRoundFraction(x: BI, y: BFChainCore.FractionJSON<string | number | bigint>): bigint;
    /**number转分数 */
    numberToFraction(y: number): BFChainCore.FractionJSON<number>;
    /**
     * 向上取整
     *
     * @param z
     */
    multiplyCeil(x: BI, y: number): bigint;
    /**
     * 与分数相乘，向上取整
     *
     * @param z
     */
    multiplyCeilFraction(x: BI, y: BFChainCore.FractionJSON): bigint;
    /**
     * 比较两个分数的大小
     *
     * @return 0: fraction1 === fraction2
     * @return 1: fraction1 > fraction2
     * @return -1: fraction1 < fraction2
     *
     * @param fraction1
     * @param fraction2
     */
    compareFraction(fraction1: BFChainCore.FractionJSON<BI>, fraction2: BFChainCore.FractionJSON<BI>): 1 | -1 | 0;
}
export {};
//# sourceMappingURL=jsbiHelper.d.ts.map