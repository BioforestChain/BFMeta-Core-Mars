import { Transaction } from "@bfchain/core-model-transaction-base";
import { VoteAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * vote 交易模型
 *
 */
export declare class VoteTransaction extends Transaction<BFChainCore.VoteAssetJSON> implements BFChainCore.VoteTransactionJSON {
    toJSON: () => BFChainCore.VoteTransactionJSON;
    recipientId: string;
    asset: VoteAssetModel;
}
//# sourceMappingURL=vote.transaction.d.ts.map