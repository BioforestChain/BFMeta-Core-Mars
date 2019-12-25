import { Transaction } from "@bfchain/core-model-transaction-base";
import { SetLnsManagerAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * setLnsManager 交易模型
 *
 */
export declare class SetLnsManagerTransaction extends Transaction<BFChainCore.SetLnsManagerAssetJSON> implements BFChainCore.SetLnsManagerTransactionJSON {
    toJSON: () => BFChainCore.SetLnsManagerTransactionJSON;
    recipientId: string;
    asset: SetLnsManagerAssetModel;
}
//# sourceMappingURL=setLnsManager.transaction.d.ts.map