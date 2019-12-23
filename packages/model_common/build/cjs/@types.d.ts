declare namespace BFChainCore {
    interface FractionJSON<T extends number | bigint | string = number> {
        numerator: T;
        denominator: T;
    }
    interface RangeJSON {
        start: number;
        end: number;
    }
    interface RateJSON<T extends number | bigint | string = number> {
        prevWeight: T;
        nextWeight: T;
    }
}
//# sourceMappingURL=@types.d.ts.map