import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeSpecialAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class ToExchangeSpecialAssetTransaction extends Transaction<BFChainCore.ToExchangeSpecialAssetAssetJSON> implements BFChainCore.ToExchangeSpecialAssetTransactionJSON {
    toJSON: () => BFChainCore.ToExchangeSpecialAssetTransactionJSON;
    recipientId: undefined;
    asset: ToExchangeSpecialAssetAssetModel;
}
