import { Transaction } from "@bfchain/core-model-transaction-base";
import { MarkAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * mark 交易模型
 *
 */
export declare class MarkTransaction extends Transaction<BFChainCore.MarkAssetJSON> implements BFChainCore.MarkTransactionJSON {
    toJSON: () => BFChainCore.MarkTransactionJSON;
    recipientId: string;
    asset: MarkAssetModel;
}
//# sourceMappingURL=mark.transaction.d.ts.map