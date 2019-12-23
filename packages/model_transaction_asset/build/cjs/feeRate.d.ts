import { Message } from "@bfchain/protobuf";
import { Fraction } from "@bfchain/core-model-common";
/**
 * FeeRateModel 模型
 *
 */
export declare class FeeRateModel extends Message<FeeRateModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.FeeRateJSON> {
    /**区块时间间隔 */
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
//# sourceMappingURL=feeRate.d.ts.map