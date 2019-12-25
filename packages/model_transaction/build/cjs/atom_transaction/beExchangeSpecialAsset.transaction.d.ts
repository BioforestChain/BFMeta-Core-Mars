import { Transaction } from "@bfchain/core-model-transaction-base";
import { BeExchangeSpecialAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * beExchangeSpecialAsset 交易模型
 *
 */
export declare class BeExchangeSpecialAssetTransaction extends Transaction<BFChainCore.BeExchangeSpecialAssetAssetJSON> implements BFChainCore.BeExchangeSpecialAssetTransactionJSON {
    toJSON: () => BFChainCore.BeExchangeSpecialAssetTransactionJSON;
    recipientId: string;
    asset: BeExchangeSpecialAssetAssetModel;
}
//# sourceMappingURL=beExchangeSpecialAsset.transaction.d.ts.map