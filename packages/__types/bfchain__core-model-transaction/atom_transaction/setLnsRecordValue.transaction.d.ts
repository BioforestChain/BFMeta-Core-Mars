import { Transaction } from "@bfchain/core-model-transaction-base";
import { SetLnsRecordValueAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class SetLnsRecordValueTransaction extends Transaction<BFChainCore.SetLnsRecordValueAssetJSON> implements BFChainCore.SetLnsRecordValueTransactionJSON {
    toJSON: () => BFChainCore.SetLnsRecordValueTransactionJSON;
    recipientId: undefined;
    asset: SetLnsRecordValueAssetModel;
}
