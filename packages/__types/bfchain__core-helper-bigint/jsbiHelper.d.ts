declare type BI = bigint | number | string;
export declare class JSBIHelper {
    multiplyFloor(x: BI, y: number): bigint;
    multiplyFloorFraction(x: BI, y: BFChainCore.FractionJSON<string | number | bigint>): bigint;
    multiplyFloorFractionString(x: BI, y: {
        numerator: BI;
        denominator: BI;
    }): bigint;
    multiplyRound(x: BI, y: number): bigint;
    multiplyRoundFraction(x: BI, y: BFChainCore.FractionJSON<string | number | bigint>): bigint;
    numberToFraction(y: number): BFChainCore.FractionJSON<number>;
    multiplyCeil(x: BI, y: number): bigint;
    multiplyCeilFraction(x: BI, y: BFChainCore.FractionJSON): bigint;
    compareFraction(fraction1: BFChainCore.FractionJSON<BI>, fraction2: BFChainCore.FractionJSON<BI>): 1 | -1 | 0;
}
export {};
