import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * exchangeAsset 交易模型
 *
 */
export declare class ToExchangeAssetTransaction extends Transaction<BFChainCore.ToExchangeAssetAssetJSON> implements BFChainCore.ToExchangeAssetTransactionJSON {
    toJSON: () => BFChainCore.ToExchangeAssetTransactionJSON;
    recipientId: undefined;
    asset: ToExchangeAssetAssetModel;
}
//# sourceMappingURL=toExchangeAsset.transaction.d.ts.map