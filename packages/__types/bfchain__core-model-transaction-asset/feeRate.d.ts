import { Message } from "@bfchain/protobuf";
import { Fraction } from "@bfchain/core-model-common";
export declare class FeeRateModel extends Message<FeeRateModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.FeeRateJSON> {
    senderPaidFeeRate: Fraction;
    recipientPaidFeeRate: Fraction;
    toJSON(): {
        senderPaidFeeRate: {
            numerator: number;
            denominator: number;
        };
        recipientPaidFeeRate: {
            numerator: number;
            denominator: number;
        };
    };
}
