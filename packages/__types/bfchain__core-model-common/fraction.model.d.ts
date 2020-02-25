import { Message } from "@bfchain/protobuf";
export declare class Fraction extends Message<Fraction> implements BFChainUtil.JSONAble<BFChainCore.FractionJSON> {
    numerator: number;
    denominator: number;
    toJSON(): {
        numerator: number;
        denominator: number;
    };
}
export declare class FractionBigIntModel extends Message<FractionBigIntModel> implements BFChainUtil.JSONAble<BFChainCore.FractionJSON<string>> {
    numerator: string;
    denominator: string;
    toJSON(): {
        numerator: string;
        denominator: string;
    };
}
