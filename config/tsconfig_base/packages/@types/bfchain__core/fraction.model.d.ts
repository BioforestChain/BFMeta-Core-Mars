import { Message } from "@bfchain/protobuf";
export declare class Fraction extends Message<Fraction> implements BFChainUtil.JSONAble<BFChainCore.FractionJSON> {
    /**分子 */
    numerator: number;
    denominator: number;
    toJSON(): {
        numerator: number;
        denominator: number;
    };
}
export declare class FractionBigIntModel extends Message<FractionBigIntModel> implements BFChainUtil.JSONAble<BFChainCore.FractionJSON<string>> {
    /**分子 */
    numerator: string;
    denominator: string;
    toJSON(): {
        numerator: string;
        denominator: string;
    };
}
//# sourceMappingURL=fraction.model.d.ts.map