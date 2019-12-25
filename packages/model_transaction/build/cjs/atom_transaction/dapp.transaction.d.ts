import { Transaction } from "@bfchain/core-model-transaction-base";
import { DAppAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * dapp 交易模型
 *
 */
export declare class DAppTransaction extends Transaction<BFChainCore.DAppAssetJSON> implements BFChainCore.DAppTransactionJSON {
    toJSON: () => BFChainCore.DAppTransactionJSON;
    recipientId: undefined;
    asset: DAppAssetModel;
}
//# sourceMappingURL=dapp.transaction.d.ts.map