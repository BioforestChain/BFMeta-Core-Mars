import { Transaction } from "@bfchain/core-model-transaction-base";
import { SetLnsRecordValueAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * setLnsRecordValue 交易模型
 *
 */
export declare class SetLnsRecordValueTransaction extends Transaction<BFChainCore.SetLnsRecordValueAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.SetLnsRecordValueAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.SetLnsRecordValueAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: SetLnsRecordValueAssetModel;
}
//# sourceMappingURL=setLnsRecordValue.transaction.d.ts.map